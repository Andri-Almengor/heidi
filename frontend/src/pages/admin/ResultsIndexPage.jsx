import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ResultsIndexPage() {
  useDocumentTitle('Results');
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await adminApi.listSessions(token); setSessions((result.sessions || []).filter((session) => session.status !== 'DRAFT')); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }, [token]);
  useEffect(() => { load(); }, [load]);
  return <><PageHeader eyebrow="Administrator / Results" title="Results & Progress" description="Choose an open or completed Heidi chapter to review participant progress." />{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : sessions.length === 0 ? <div className="surface-card"><EmptyState title="No results available" message="Open a session before reviewing participant progress." /></div> : <div className="surface-card data-table-wrap"><table className="data-table"><thead><tr><th>Session</th><th>Status</th><th>Code</th><th>Participants</th><th>Questions</th><th /></tr></thead><tbody>{sessions.map((session) => <tr key={session.sessionId}><td><strong>{session.title}</strong><div className="label-sm muted">{session.description}</div></td><td><StatusBadge status={session.status} /></td><td><strong>{session.publicCode}</strong></td><td>{session.participantCount}</td><td>{session.questionCount}</td><td><Link className="btn btn-outline" to={`/admin/sessions/${session.sessionId}/results`}>View results</Link></td></tr>)}</tbody></table></div>}</>;
}
