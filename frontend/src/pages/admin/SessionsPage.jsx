import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { SessionCard } from '../../components/admin/SessionCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function SessionsPage() {
  useDocumentTitle('Sessions');
  const { token } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await adminApi.listSessions(token, { status });
      setSessions(result.sessions || []);
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [token, status]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return sessions.filter((session) => !needle || `${session.title} ${session.description} ${session.publicCode}`.toLowerCase().includes(needle));
  }, [sessions, search]);

  async function runAction() {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.action === 'open') await adminApi.openSession(token, confirm.session.sessionId);
      if (confirm.action === 'close') await adminApi.closeSession(token, confirm.session.sessionId);
      if (confirm.action === 'delete') await adminApi.deleteSession(token, confirm.session.sessionId);
      showToast(confirm.action === 'open' ? 'The session is now open to guests.' : confirm.action === 'close' ? 'The session has been closed.' : 'The draft session was deleted.', 'success');
      setConfirm(null);
      await load();
    } catch (requestError) { showToast(requestError.message, 'error'); }
    finally { setBusy(false); }
  }

  const confirmationCopy = confirm ? {
    open: { title: 'Open this session?', message: 'Guests with the code or link will be able to join and submit answers.', label: 'Open session' },
    close: { title: 'Close this session?', message: 'Participants will no longer be able to join or submit new answers.', label: 'Close session' },
    delete: { title: 'Delete this draft?', message: 'The session will be removed. Its questions will remain in the library.', label: 'Delete draft' },
  }[confirm.action] : null;

  return (
    <>
      <PageHeader eyebrow="Administrator / Sessions" title="Active Sessions" description="Create and manage unlimited-participant quiz journeys through Heidi’s world." actions={<Link className="btn btn-secondary" to="/admin/sessions/new"><span className="material-symbols-outlined">add</span>New session</Link>} />
      <section className="surface-card filter-bar">
        <div className="input-with-icon search"><span className="material-symbols-outlined">search</span><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sessions, codes, or chapters" /></div>
        <select className="select" style={{ width: 'auto' }} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select>
        <button className="btn btn-outline" onClick={() => { setSearch(''); setStatus(''); }}>Clear</button>
      </section>
      {loading ? <LoadingState message="Gathering the latest sessions…" /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? <div className="surface-card"><EmptyState icon="event_available" title="No sessions found" message="Create a session or adjust the filters." action={<Link className="btn btn-secondary" to="/admin/sessions/new">Create a session</Link>} /></div> : <section className="session-grid">{filtered.map((session) => <SessionCard key={session.sessionId} session={session} onOpen={(item) => setConfirm({ action: 'open', session: item })} onClose={(item) => setConfirm({ action: 'close', session: item })} onDelete={(item) => setConfirm({ action: 'delete', session: item })} />)}</section>}
      <ConfirmModal open={Boolean(confirm)} title={confirmationCopy?.title} message={confirmationCopy?.message} confirmLabel={confirmationCopy?.label} danger={confirm?.action !== 'open'} busy={busy} onConfirm={runAction} onClose={() => setConfirm(null)} />
    </>
  );
}
