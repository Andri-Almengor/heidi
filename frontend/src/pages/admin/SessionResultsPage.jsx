import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { Modal } from '../../components/common/Modal';
import { PageHeader } from '../../components/common/PageHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { usePolling } from '../../hooks/usePolling';
import { formatDate, initials } from '../../utils/formatters';

export default function SessionResultsPage() {
  const { sessionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState('RANK');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  useDocumentTitle(data?.session?.title ? `${data.session.title} results` : 'Session results');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try { setData(await adminApi.results(token, sessionId)); }
    catch (requestError) { setError(requestError.message); }
    finally { if (!silent) setLoading(false); }
  }, [sessionId, token]);

  const openParticipant = useCallback(async (participantId) => {
    if (!participantId) return;
    setDetailLoading(true);
    try { setAnswers(await adminApi.participantAnswers(token, sessionId, participantId)); }
    catch (requestError) { setError(requestError.message); }
    finally { setDetailLoading(false); }
  }, [sessionId, token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const participantId = searchParams.get('participant'); if (participantId) openParticipant(participantId); }, [searchParams, openParticipant]);
  usePolling(() => load(true), 5000, data?.session?.status === 'OPEN');

  const participants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const items = (data?.participants || []).filter((participant) => {
      const statusMatch = filter === 'ALL' || (filter === 'COMPLETED' ? participant.status === 'COMPLETED' : participant.status !== 'COMPLETED');
      return statusMatch && (!needle || participant.guestName.toLowerCase().includes(needle));
    });
    return [...items].sort((a, b) => {
      if (sort === 'NAME') return a.guestName.localeCompare(b.guestName);
      if (sort === 'PROGRESS') return b.progressPercent - a.progressPercent;
      if (sort === 'RECENT') return String(b.lastActivityAt).localeCompare(String(a.lastActivityAt));
      return (a.rank || 999) - (b.rank || 999);
    });
  }, [data, filter, sort, search]);

  function closeDetails() {
    setAnswers(null);
    setSearchParams((params) => { params.delete('participant'); return params; }, { replace: true });
  }

  if (loading) return <LoadingState message="Collecting participant results…" />;
  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <>
      <PageHeader eyebrow={<><Link to="/admin/sessions">Sessions</Link><span>/</span><Link to={`/admin/sessions/${sessionId}`}>{data.session.title}</Link><span>/</span><span>Results</span></>} title="Participant Progress" description="Live rankings, answer totals, and detailed responses for this Heidi chapter." actions={data.session.status === 'OPEN' ? <span className="badge badge-open"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>sensors</span>Refreshing every 5 seconds</span> : <StatusBadge status={data.session.status} />} />

      <section className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
        <article className="surface-card stat-card"><div className="label-sm uppercase muted">Participants</div><div className="stat-value">{data.summary.participantCount}</div></article>
        <article className="surface-card stat-card"><div className="label-sm uppercase muted">Completed</div><div className="stat-value">{data.summary.completedCount}</div></article>
        <article className="surface-card stat-card"><div className="label-sm uppercase muted">In progress</div><div className="stat-value">{data.summary.inProgressCount}</div></article>
        <article className="surface-card stat-card"><div className="label-sm uppercase muted">Questions</div><div className="stat-value">{data.summary.questionCount}</div></article>
      </section>

      <section className="surface-card filter-bar">
        <div className="input-with-icon search"><span className="material-symbols-outlined">search</span><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search participant names" /></div>
        <select className="select" style={{ width: 'auto' }} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All participants</option><option value="PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select>
        <select className="select" style={{ width: 'auto' }} value={sort} onChange={(event) => setSort(event.target.value)}><option value="RANK">Best score</option><option value="PROGRESS">Highest progress</option><option value="NAME">Name</option><option value="RECENT">Recent activity</option></select>
      </section>

      {participants.length === 0 ? <div className="surface-card"><EmptyState icon="groups" title="No participants match" message="Adjust the filters or wait for guests to join." /></div> : <div className="surface-card data-table-wrap"><table className="data-table"><thead><tr><th>Rank</th><th>Participant</th><th>Answered</th><th>Correct</th><th>Incorrect</th><th>Score</th><th>Progress</th><th>Status</th><th /></tr></thead><tbody>{participants.map((participant) => <tr key={participant.participantId}><td><strong>#{participant.rank}</strong></td><td><div className="participant-cell"><div className="avatar">{initials(participant.guestName)}</div><div><strong>{participant.guestName}</strong><div className="label-sm muted">{formatDate(participant.lastActivityAt, { withTime: true })}</div></div></div></td><td>{participant.answeredCount}/{participant.totalQuestions}</td><td>{participant.correctCount}</td><td>{participant.incorrectCount}</td><td><strong>{participant.score}</strong></td><td style={{ minWidth: 160 }}><ProgressBar value={participant.progressPercent} label={`${participant.progressPercent}%`} /></td><td><StatusBadge status={participant.status === 'COMPLETED' ? 'COMPLETED' : 'PROGRESS'} /></td><td><button className="btn btn-ghost btn-icon" onClick={() => { setSearchParams({ participant: participant.participantId }); openParticipant(participant.participantId); }} aria-label={`View ${participant.guestName}'s answers`}><span className="material-symbols-outlined">visibility</span></button></td></tr>)}</tbody></table></div>}

      <Modal open={Boolean(answers || detailLoading)} title={answers ? `${answers.participant.guestName}'s answers` : 'Loading answers'} onClose={closeDetails}>
        {detailLoading ? <LoadingState message="Reading the answer trail…" /> : answers && <div className="stack-md">
          <div className="session-meta" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}><div><div className="label-sm muted">Score</div><strong>{answers.participant.score}</strong></div><div><div className="label-sm muted">Correct</div><strong>{answers.participant.correctCount}</strong></div><div><div className="label-sm muted">Progress</div><strong>{answers.participant.progressPercent}%</strong></div></div>
          {answers.answers.length === 0 ? <EmptyState title="No answers yet" /> : answers.answers.map((answer, index) => <article className="surface-card" style={{ padding: 16, background: answer.isCorrect ? 'var(--success-container)' : 'var(--error-container)' }} key={answer.answerId}><div className="label-sm uppercase">Question {index + 1}</div><strong style={{ display: 'block', margin: '8px 0' }}>{answer.questionText}</strong><div className="label-sm">Selected: {answer.selectedOptionId} · Correct: {answer.correctOptionId}</div><div className="badge" style={{ marginTop: 10, background: answer.isCorrect ? 'white' : 'rgba(255,255,255,.6)', color: answer.isCorrect ? 'var(--success)' : 'var(--error)' }}><span className="material-symbols-outlined" style={{ fontSize: 17 }}>{answer.isCorrect ? 'check_circle' : 'cancel'}</span>{answer.isCorrect ? 'Correct answer' : 'Incorrect answer'}</div></article>)}
        </div>}
      </Modal>
    </>
  );
}
