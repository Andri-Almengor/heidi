import { NavLink, Outlet } from 'react-router-dom';
import { Brand } from '../components/common/Brand';

export function PublicLayout() {
  return (
    <div className="page-shell">
      <header className="public-topbar">
        <div className="container public-topbar-inner">
          <Brand />
          <nav className="public-nav" aria-label="Primary navigation">
            <NavLink to="/" end>Home</NavLink>
            <a href="#features">Explore</a>
            <a href="#about">About</a>
          </nav>
          <div style={{ display: 'flex', gap: 8 }}>
            <NavLink className="btn btn-ghost" to="/login">Sign in</NavLink>
            <NavLink className="btn btn-secondary" to="/login?tab=guest">Join a quiz</NavLink>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
