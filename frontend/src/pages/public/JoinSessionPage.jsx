import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import chalet from '../../assets/illustrations/chalet.svg';
import { publicApi } from '../../api/publicApi';
import { LoadingState, ErrorState } from '../../components/common/StateViews';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useGuest } from '../../context/GuestContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function JoinSessionPage() {
  useDocumentTitle('Join a session');
  const { publicCode } = useParams();
  const navigate = useNavigate();
  const { join, loading: joining } = useGuest();
  const [session, setSession] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await publicApi.session(publicCode);
      setSession(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [publicCode]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await join(publicCode, guestName.trim());
      navigate('/guest/quiz');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <div className="join-page"><div className="surface-card" style={{ width: 'min(760px,100%)' }}><LoadingState message="Following the trail to your session…" /></div></div>;
  if (!session) return <div className="join-page"><div className="surface-card" style={{ width: 'min(760px,100%)' }}><ErrorState message={error} onRetry={load} /></div></div>;

  return (
    <div className="join-page">
      <section className="surface-card join-panel">
        <div className="join-art"><img src={chalet} alt="Grandfather's cabin in the Alps" /></div>
        <div className="join-form">
          <Link className="label-sm muted" to="/">← Heidi Quiz home</Link>
          <div style={{ marginTop: 24 }}><StatusBadge status={session.status} /></div>
          <h1 className="headline-lg" style={{ margin: '16px 0 10px' }}>{session.title}</h1>
          <p className="muted">{session.description}</p>
          <div className="session-meta" style={{ margin: '22px 0' }}>
            <div><div className="label-sm muted">Session code</div><strong>{session.publicCode}</strong></div>
            <div><div className="label-sm muted">Questions</div><strong>{session.questionCount}</strong></div>
          </div>
          {session.canJoin ? (
            <form className="stack-md" onSubmit={submit}>
              <div className="field"><label htmlFor="guest-name">Your guest name</label><input className="input" id="guest-name" value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="How should we show your name?" minLength="2" maxLength="60" required /></div>
              {error && <div className="field-error">{error}</div>}
              <button className="btn btn-secondary" type="submit" disabled={joining}>{joining ? 'Joining…' : <><span className="material-symbols-outlined">hiking</span>Join the session</>}</button>
            </form>
          ) : <div className="surface-card" style={{ padding: 18, background: 'var(--warning-container)' }}><strong>This session is not open.</strong><p className="muted" style={{ margin: '6px 0 0' }}>Ask the administrator to open it before joining.</p></div>}
        </div>
      </section>
    </div>
  );
}
