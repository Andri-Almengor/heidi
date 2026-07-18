import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initials } from '../../utils/formatters';

function titleFromPath(pathname) {
  if (pathname.includes('/questions')) return 'Question Library';
  if (pathname.includes('/sessions')) return 'Session Management';
  if (pathname.includes('/results')) return 'Results & Progress';
  if (pathname.includes('/profile')) return 'Administrator Profile';
  return 'System Overview';
}

export function AdminTopbar({ onMenu }) {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenu} aria-label="Open navigation"><span className="material-symbols-outlined">menu</span></button>
        <div>
          <strong style={{ color: 'var(--primary)' }}>{titleFromPath(location.pathname)}</strong>
          <div className="label-sm muted">Heidi Quiz administration</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn btn-ghost btn-icon" aria-label="Notifications"><span className="material-symbols-outlined">notifications</span></button>
        <div className="avatar">{initials(user?.username || 'Admin')}</div>
      </div>
    </header>
  );
}
