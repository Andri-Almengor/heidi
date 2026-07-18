import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import alpineHero from '../../assets/illustrations/alpine-hero.svg';
import { Brand } from '../../components/common/Brand';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'guest' ? 'guest' : 'admin');
  const [adminValues, setAdminValues] = useState({ username: '', password: '' });
  const [guestCode, setGuestCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  async function submitAdmin(event) {
    event.preventDefault();
    setError('');
    try {
      await login(adminValues);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Sign in failed.');
    }
  }

  function submitGuest(event) {
    event.preventDefault();
    setError('');
    const code = guestCode.trim().toUpperCase();
    if (!code) {
      setError('Enter the session code shared by the administrator.');
      return;
    }
    navigate(`/join/${code}`);
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <img src={alpineHero} alt="Illustrated Alpine mountains, cabin, and goats" />
        <div className="auth-visual-copy">
          <div className="hero-chip label-sm uppercase" style={{ background: 'rgba(255,255,255,.16)', color: 'white', borderColor: 'rgba(255,255,255,.28)' }}><span className="material-symbols-outlined">landscape</span>Welcome to the Alm</div>
          <h2 className="headline-xl" style={{ margin: '20px 0 14px' }}>Every good question opens a new trail.</h2>
          <p className="body-lg" style={{ color: 'rgba(255,255,255,.82)' }}>Create Alpine story quizzes as an administrator, or join a shared session as a guest.</p>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <Brand />
          <h1 className="headline-lg" style={{ margin: '32px 0 8px' }}>Welcome back</h1>
          <p className="muted">Choose how you would like to enter Heidi Quiz.</p>
          <div className="auth-tabs" role="tablist">
            <button className={`auth-tab ${tab === 'admin' ? 'active' : ''}`} onClick={() => { setTab('admin'); setError(''); }} type="button">Administrator</button>
            <button className={`auth-tab ${tab === 'guest' ? 'active' : ''}`} onClick={() => { setTab('guest'); setError(''); }} type="button">Guest</button>
          </div>

          {tab === 'admin' ? (
            <form className="stack-md" onSubmit={submitAdmin}>
              <div className="field"><label htmlFor="admin-username">Username</label><div className="input-with-icon"><span className="material-symbols-outlined">person</span><input className="input" id="admin-username" autoComplete="username" value={adminValues.username} onChange={(event) => setAdminValues({ ...adminValues, username: event.target.value })} placeholder="Enter your username" required /></div></div>
              <div className="field"><label htmlFor="admin-password">Password</label><div className="password-wrap"><input className="input" id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={adminValues.password} onChange={(event) => setAdminValues({ ...adminValues, password: event.target.value })} placeholder="Enter your password" required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}><span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span></button></div></div>
              {error && <div className="field-error" role="alert">{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? <><span className="spinner" style={{ width: 18, height: 18 }} />Signing in…</> : <><span className="material-symbols-outlined">login</span>Sign in</>}</button>
            </form>
          ) : (
            <form className="stack-md" onSubmit={submitGuest}>
              <div className="field"><label htmlFor="guest-code">Session code</label><div className="input-with-icon"><span className="material-symbols-outlined">key</span><input className="input" id="guest-code" value={guestCode} onChange={(event) => setGuestCode(event.target.value.toUpperCase())} placeholder="Example: ALM1974" autoCapitalize="characters" required /></div><span className="label-sm muted">Use the code or link shared by your quiz administrator.</span></div>
              {error && <div className="field-error" role="alert">{error}</div>}
              <button className="btn btn-secondary" type="submit"><span className="material-symbols-outlined">hiking</span>Continue as guest</button>
            </form>
          )}
          <p className="label-sm muted" style={{ textAlign: 'center', marginTop: 30 }}><Link to="/">Return to the mountain home</Link></p>
        </div>
      </section>
    </div>
  );
}
