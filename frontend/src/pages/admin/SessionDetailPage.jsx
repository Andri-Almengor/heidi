import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CopyButton } from '../../components/common/CopyButton';
import { PageHeader } from '../../components/common/PageHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePolling } from '../../hooks/usePolling';
import { formatDate, initials, sessionJoinUrl } from '../../utils/formatters';

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  useDocumentTitle(detail?.session?.title || 'Session details');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const sessionData = await adminApi.getSession(token, sessionId);
      setDetail(sessionData);
      if (sessionData.session.status !== 'DRAFT') {
        const resultData = await adminApi.results(token, sessionId);
        setResults(resultData);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { if (!silent) setLoading(false); }
  }, [sessionId, token]);

  useEffect(() => { load(); }, [load]);
  usePolling(() => load(true), 5000, detail?.session?.status === 'OPEN');

  async function action() {
    setBusy(true);
    try {
      if (confirm === 'open') await adminApi.openSession(token, sessionId);
      if (confirm === 'close') await adminApi.closeSession(token, sessionId);
      if (confirm === 'delete') {
        await adminApi.deleteSession(token, sessionId);
        showToast('The draft session was deleted.', 'success');
        navigate('/admin/sessions');
        return;
      }
      showToast(confirm === 'open' ? 'The session is now open.' : 'The session is closed.', 'success');
      setConfirm('');
      await load();
    } catch (requestError) { showToast(requestError.message, 'error'); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingState message="Opening the live session board…" />;
  if (error || !detail) return <ErrorState message={error} onRetry={load} />;
  const { session, questions } = detail;
  const participants = results?.participants || [];
  const joinUrl = sessionJoinUrl(session);
  const copy = {
    open: ['Open this session?', 'Guests will be able to join with the code and submit answers.', 'Open session'],
    close: ['Close this session?', 'Guests will no longer be able to join or submit answers.', 'Close session'],
    delete: ['Delete this draft?', 'This draft will be removed, while its questions stay in the library.', 'Delete draft'],
  }[confirm];

  return (
    <>
      <PageHeader eyebrow={<><Link to="/admin/sessions">Sessions</Link><span>/</span><span>{session.title}</span></>} title={session.title} description={session.description} actions={<>{session.status === 'DRAFT' && <Link className="btn btn-outline" to={`/admin/sessions/${sessionId}/edit`}><span className="material-symbols-outlined">edit</span>Edit</Link>}{session.status !== 'DRAFT' && <Link className="btn btn-outline" to={`/admin/sessions/${sessionId}/results`}><span className="material-symbols-outlined">leaderboard</span>Full results</Link>}{session.status === 'DRAFT' && <button className="btn btn-secondary" onClick={() => setConfirm('open')}><span className="material-symbols-outlined">play_arrow</span>Open</button>}{session.status === 'OPEN' && <button className="btn btn-danger" onClick={() => setConfirm('close')}><span className="material-symbols-outlined">stop_circle</span>Close</button>}</>} />

      <section className="session-detail-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}><div><StatusBadge status={session.status} /><div className="label-sm uppercase" style={{ marginTop: 20, color: 'rgba(255,255,255,.72)' }}>Share this mountain code</div><div className="session-code-large">{session.publicCode}</div></div><div className="page-actions"><CopyButton value={session.publicCode} label="Copy code" className="btn btn-sun" /><CopyButton value={joinUrl} label="Copy link" className="btn btn-outline" /></div></div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', color: 'rgba(255,255,255,.82)' }}><span><strong style={{ color: 'white' }}>{session.questionCount}</strong> questions</span><span><strong style={{ color: 'white' }}>{session.participantCount}</strong> participants</span><span>Created {formatDate(session.createdAt)}</span>{session.openedAt && <span>Opened {formatDate(session.openedAt, { withTime: true })}</span>}</div>
      </section>

      <div className="detail-grid">
        <section className="detail-main">
          <article className="surface-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 18 }}><div><h2 className="headline-md" style={{ marginBottom: 4 }}>Participant progress</h2><p className="muted" style={{ marginBottom: 0 }}>{session.status === 'OPEN' ? 'Updates refresh every five seconds.' : 'Final progress for this session.'}</p></div>{session.status === 'OPEN' && <span className="badge badge-open"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>sensors</span>Live updates</span>}</div>
            {participants.length === 0 ? <EmptyState icon="groups" title="No guests have joined yet" message="Share the code or link to invite participants." /> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Participant</th><th>Answered</th><th>Correct</th><th>Progress</th><th>Status</th><th /></tr></thead><tbody>{participants.slice(0, 8).map((participant) => <tr key={participant.participantId}><td><div className="participant-cell"><div className="avatar">{initials(participant.guestName)}</div><div><strong>{participant.guestName}</strong><div className="label-sm muted">Last active {formatDate(participant.lastActivityAt, { withTime: true })}</div></div></div></td><td>{participant.answeredCount}/{participant.totalQuestions}</td><td>{participant.correctCount}</td><td style={{ minWidth: 150 }}><ProgressBar value={participant.progressPercent} label={`${participant.progressPercent}%`} /></td><td><StatusBadge status={participant.status === 'COMPLETED' ? 'COMPLETED' : 'PROGRESS'} /></td><td><Link className="btn btn-ghost btn-icon" to={`/admin/sessions/${sessionId}/results?participant=${participant.participantId}`} aria-label={`View ${participant.guestName}`}><span className="material-symbols-outlined">chevron_right</span></Link></td></tr>)}</tbody></table></div>}
          </article>
        </section>
        <aside className="detail-side">
          <article className="surface-card" style={{ padding: 24 }}><h2 className="headline-md">Question trail</h2><div style={{ display: 'grid', gap: 10 }}>{questions.map((question, index) => <div className="option-preview" key={question.questionId}><span className="option-letter" style={{ width: 32, height: 32, flex: '0 0 32px' }}>{index + 1}</span><span>{question.questionText}</span></div>)}</div></article>
          {session.status === 'DRAFT' && <button className="btn btn-ghost" style={{ width: '100%', marginTop: 16, color: 'var(--error)' }} onClick={() => setConfirm('delete')}><span className="material-symbols-outlined">delete</span>Delete draft</button>}
        </aside>
      </div>
      <ConfirmModal open={Boolean(confirm)} title={copy?.[0]} message={copy?.[1]} confirmLabel={copy?.[2]} danger={confirm !== 'open'} busy={busy} onConfirm={action} onClose={() => setConfirm('')} />
    </>
  );
}
