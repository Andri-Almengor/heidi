import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { StatCard } from '../../components/admin/StatCard';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/StateViews';
import { useAuth } from '../../context/AuthContext';
import { mockActivity } from '../../data/mockData';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate } from '../../utils/formatters';

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { token } = useAuth();
  const [data, setData] = useState({ questions: [], sessions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [questionData, sessionData] = await Promise.all([
        adminApi.listQuestions(token, { includeInactive: true }),
        adminApi.listSessions(token),
      ]);
      setData({ questions: questionData.questions || [], sessions: sessionData.sessions || [] });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const metrics = useMemo(() => {
    const sessions = data.sessions;
    const totalParticipants = sessions.reduce((sum, session) => sum + (Number(session.participantCount) || 0), 0);
    return {
      questions: data.questions.filter((question) => question.active).length,
      sessions: sessions.length,
      open: sessions.filter((session) => session.status === 'OPEN').length,
      participants: totalParticipants,
      completion: totalParticipants ? `${Math.min(100, Math.round((sessions.filter((session) => session.status === 'CLOSED').reduce((sum, session) => sum + session.participantCount, 0) / totalParticipants) * 100))}%` : '—',
    };
  }, [data]);

  if (loading) return <LoadingState message="Preparing the administrator overview…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const bars = [42, 68, 54, 82, 64, 92, 74];

  return (
    <>
      <PageHeader
        eyebrow="Administrator / Dashboard"
        title="System Overview"
        description="Real-time session activity and the health of your Heidi story library."
        actions={<><Link className="btn btn-outline" to="/admin/questions/new"><span className="material-symbols-outlined">add_circle</span>New question</Link><Link className="btn btn-secondary" to="/admin/sessions/new"><span className="material-symbols-outlined">calendar_add_on</span>New session</Link></>}
      />
      <section className="kpi-grid">
        <StatCard icon="quiz" label="Total questions" value={metrics.questions} trend="Alpine library" />
        <StatCard icon="event_available" label="Created sessions" value={metrics.sessions} trend="All chapters" tone="sky" />
        <StatCard icon="sensors" label="Open sessions" value={metrics.open} trend="Live now" />
        <StatCard icon="groups" label="Participants" value={metrics.participants} trend="Across sessions" tone="sun" />
        <StatCard icon="trending_up" label="Completion signal" value={metrics.completion} trend="Closed sessions" />
      </section>

      <section className="dashboard-grid">
        <article className="surface-card chart-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div><h2 className="headline-md" style={{ marginBottom: 4 }}>Mountain trail activity</h2><p className="muted">Participant movement during the last seven checkpoints.</p></div>
            <span className="badge badge-open"><span className="material-symbols-outlined" style={{ fontSize: 16 }}>sync</span>Live overview</span>
          </div>
          <div className="bar-chart" aria-label="Weekly participation chart">
            {bars.map((height, index) => <div className="bar-item" key={index}><div className="bar" style={{ height: `${height}%` }} /><span className="label-sm muted">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</span></div>)}
          </div>
        </article>
        <article className="surface-card chart-card">
          <h2 className="headline-md" style={{ marginBottom: 4 }}>Recent activity</h2>
          <p className="muted">The latest steps taken around the Alm.</p>
          <div className="activity-list">
            {mockActivity.map((item) => <div className="activity-item" key={item.title}><div className="activity-icon"><span className="material-symbols-outlined">{item.icon}</span></div><div><strong>{item.title}</strong><div className="label-sm muted">{item.time}</div></div></div>)}
          </div>
        </article>
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}><div><h2 className="headline-md" style={{ marginBottom: 4 }}>Recent sessions</h2><p className="muted" style={{ marginBottom: 0 }}>Continue managing the latest Alpine chapters.</p></div><Link className="btn btn-ghost" to="/admin/sessions">View all</Link></div>
        {data.sessions.length === 0 ? <div className="surface-card"><EmptyState title="No sessions yet" action={<Link className="btn btn-secondary" to="/admin/sessions/new">Create the first session</Link>} /></div> : (
          <div className="surface-card data-table-wrap">
            <table className="data-table">
              <thead><tr><th>Session</th><th>Status</th><th>Code</th><th>Questions</th><th>Participants</th><th>Created</th><th /></tr></thead>
              <tbody>{data.sessions.slice(0, 5).map((session) => <tr key={session.sessionId}><td><strong>{session.title}</strong><div className="label-sm muted">{session.description}</div></td><td><StatusBadge status={session.status} /></td><td><strong>{session.publicCode}</strong></td><td>{session.questionCount}</td><td>{session.participantCount}</td><td>{formatDate(session.createdAt)}</td><td><Link className="btn btn-ghost btn-icon" to={`/admin/sessions/${session.sessionId}`} aria-label={`Open ${session.title}`}><span className="material-symbols-outlined">arrow_forward</span></Link></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
