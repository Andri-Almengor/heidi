import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import alpineHero from '../../assets/illustrations/alpine-hero.svg';
import { guestApi } from '../../api/guestApi';
import { ProgressBar } from '../../components/common/ProgressBar';
import { LoadingState, ErrorState } from '../../components/common/StateViews';
import { useGuest } from '../../context/GuestContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function GuestResultsPage() {
  useDocumentTitle('Your results');
  const { token, clearGuest } = useGuest();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await guestApi.progress(token)); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }, [token]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState message="Looking back over your mountain journey…" />;
  if (error || !data) return <ErrorState message={error} onRetry={load} />;
  const { participant, session } = data;
  const accuracy = participant.answeredCount ? Math.round((participant.correctCount / participant.answeredCount) * 100) : 0;

  return (
    <div className="join-page">
      <section className="surface-card" style={{ width: 'min(900px,100%)', overflow: 'hidden' }}>
        <div className="results-hero">
          <span className="badge" style={{ background: 'rgba(255,255,255,.16)', color: 'white' }}>{participant.status === 'COMPLETED' ? 'Journey completed' : 'Journey in progress'}</span>
          <h1 className="headline-lg" style={{ margin: '18px 0 8px' }}>{participant.status === 'COMPLETED' ? `Wonderful work, ${participant.guestName}!` : `Keep climbing, ${participant.guestName}!`}</h1>
          <p style={{ color: 'rgba(255,255,255,.78)' }}>{session.title}</p>
          <div className="score-ring" style={{ '--score': accuracy }}><strong>{accuracy}%</strong></div>
          <p style={{ color: 'rgba(255,255,255,.82)', marginBottom: 0 }}>Accuracy across the answers you submitted</p>
        </div>
        <div style={{ padding: 30 }}>
          <div className="session-meta" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}><div><div className="label-sm muted">Answered</div><strong>{participant.answeredCount}/{participant.totalQuestions}</strong></div><div><div className="label-sm muted">Correct</div><strong>{participant.correctCount}</strong></div><div><div className="label-sm muted">Incorrect</div><strong>{participant.incorrectCount}</strong></div><div><div className="label-sm muted">Score</div><strong>{participant.score}</strong></div></div>
          <div style={{ margin: '24px 0' }}><ProgressBar value={participant.progressPercent} label={`${participant.progressPercent}% of the quiz completed`} /></div>
          <img src={alpineHero} alt="Alpine meadow at the end of the quiz" style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 18 }} />
          <div className="page-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
            {participant.status !== 'COMPLETED' && <button className="btn btn-secondary" onClick={() => navigate('/guest/quiz')}><span className="material-symbols-outlined">hiking</span>Continue the quiz</button>}
            <button className="btn btn-outline" onClick={() => { clearGuest(); navigate('/'); }}><span className="material-symbols-outlined">home</span>Return home</button>
          </div>
        </div>
      </section>
    </div>
  );
}
