import { NavLink } from 'react-router-dom';
import { Brand } from '../common/Brand';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', end: true, icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/questions', icon: 'quiz', label: 'Questions' },
  { to: '/admin/sessions', icon: 'event_available', label: 'Sessions' },
  { to: '/admin/results', icon: 'leaderboard', label: 'Results' },
  { to: '/admin/profile', icon: 'person', label: 'Profile' },
];

export function AdminSidebar({ open, onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
      <Brand to="/admin" />
      <div className="label-sm uppercase muted" style={{ margin: '8px 0 0 50px' }}>Alpine learning portal</div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span className="material-symbols-outlined">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px 16px' }}>
          <div className="avatar">{user?.username?.slice(0, 1).toUpperCase() || 'A'}</div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username || 'Administrator'}</strong>
            <span className="label-sm muted">Quiz administrator</span>
          </div>
        </div>
        <button className="admin-nav-link" style={{ width: '100%', border: 0, background: 'transparent' }} onClick={logout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
