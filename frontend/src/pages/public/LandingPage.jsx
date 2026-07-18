import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import alpineHero from '../../assets/illustrations/alpine-hero.svg';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const features = [
  { icon: 'hiking', title: 'Explore at your own pace', text: 'Move through every question calmly, just as Heidi discovers each Alpine trail without a countdown.', span: 'span-6' },
  { icon: 'schedule', title: 'No time limits', text: 'Read the story context, study the image, and answer only when you feel ready.', span: 'span-6' },
  { icon: 'leaderboard', title: 'Live mountain progress', text: 'Administrators can watch every participant move from the first meadow to the final summit.', span: 'span-4' },
  { icon: 'photo_library', title: 'Story-rich questions', text: 'Add an image and a short narrative so every question feels connected to Heidi’s world.', span: 'span-4' },
  { icon: 'devices', title: 'Ready for every device', text: 'Join from a phone, tablet, or computer without losing progress along the way.', span: 'span-4 dark' },
];

export default function LandingPage() {
  useDocumentTitle('Home');
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  function join(event) {
    event.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) navigate(`/join/${normalized}`);
  }

  return (
    <>
      <main>
        <section className="hero-section hero-gradient">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="hero-chip label-sm uppercase"><span className="material-symbols-outlined">eco</span>Stories from the Alps</div>
              <h1 className="headline-xl" style={{ margin: '24px 0 18px' }}>Learn with Heidi,<br />one mountain path at a time</h1>
              <p className="body-lg muted" style={{ maxWidth: 620 }}>A thoughtful, untimed quiz experience inspired by Heidi’s adventures, friendships, animals, and life high above the village.</p>
              <div className="hero-actions">
                <Link className="btn btn-primary" to="/login"><span className="material-symbols-outlined">admin_panel_settings</span>Administrator sign in</Link>
                <Link className="btn btn-outline" to="/login?tab=guest"><span className="material-symbols-outlined">group</span>Join as a guest</Link>
              </div>
              <form className="join-card" onSubmit={join}>
                <div className="input-with-icon" style={{ flex: 1 }}>
                  <span className="material-symbols-outlined">key</span>
                  <input className="input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter a session code" aria-label="Session code" />
                </div>
                <button className="btn btn-secondary" type="submit">Begin the journey</button>
              </form>
            </div>
            <div className="hero-art">
              <img src={alpineHero} alt="An illustrated Alpine meadow with Grandfather's cabin and goats" />
              <div className="floating-note one"><span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>pets</span>Meet Snowflake and the herd</div>
              <div className="floating-note two"><span className="material-symbols-outlined" style={{ color: 'var(--sun)' }}>wb_sunny</span>No timer. Just fresh air.</div>
            </div>
          </div>
        </section>

        <section className="feature-section" id="features">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
              <div className="label uppercase" style={{ color: 'var(--secondary)' }}>A calmer way to quiz</div>
              <h2 className="headline-lg" style={{ margin: '10px 0 14px' }}>Designed around curiosity, not pressure</h2>
              <p className="muted body-lg">Keep the refined Stitch layout while giving every screen the warmth of Alpine meadows, wooden cabins, friendship, and discovery.</p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className={`surface-card feature-card ${feature.span}`} key={feature.title}>
                  <div className="feature-icon"><span className="material-symbols-outlined">{feature.icon}</span></div>
                  <h3 className="headline-md">{feature.title}</h3>
                  <p className={feature.span.includes('dark') ? '' : 'muted'}>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="public-footer" id="about">
        <div className="container footer-inner">
          <div><strong className="brand" style={{ justifyContent: 'center' }}>Heidi Quiz</strong><p className="muted" style={{ margin: '8px 0 0' }}>A gentle learning journey inspired by life in the Alps.</p></div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}><a href="#features">Features</a><Link to="/login">Sign in</Link><a href="mailto:support@example.com">Support</a></div>
          <div className="label-sm muted">© {new Date().getFullYear()} Heidi Quiz</div>
        </div>
      </footer>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link className="mobile-bottom-link active" to="/"><span className="material-symbols-outlined filled">home</span>Home</Link>
        <a className="mobile-bottom-link" href="#features"><span className="material-symbols-outlined">explore</span>Explore</a>
        <Link className="mobile-bottom-link" to="/login?tab=guest"><span className="material-symbols-outlined">group</span>Join</Link>
        <Link className="mobile-bottom-link" to="/login"><span className="material-symbols-outlined">person</span>Sign in</Link>
      </nav>
    </>
  );
}
