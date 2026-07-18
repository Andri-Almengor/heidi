import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/ToastProvider';

function RequiredPasswordModal() {
  const { user, updatePassword } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (values.newPassword !== values.confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      showToast('Your administrator password has been updated.', 'success');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(user?.mustChangePassword)} title="Create your permanent password" closeDisabled>
      <form className="stack-md" onSubmit={submit}>
        <p className="muted">For security, replace the temporary password before managing the quiz library.</p>
        <div className="field"><label htmlFor="required-current-password">Current password</label><input className="input" id="required-current-password" type="password" value={values.currentPassword} onChange={(event) => setValues({ ...values, currentPassword: event.target.value })} required /></div>
        <div className="field"><label htmlFor="required-new-password">New password</label><input className="input" id="required-new-password" type="password" value={values.newPassword} onChange={(event) => setValues({ ...values, newPassword: event.target.value })} minLength="10" required /><span className="label-sm muted">At least 10 characters with uppercase, lowercase, a number, and a symbol.</span></div>
        <div className="field"><label htmlFor="required-confirm-password">Confirm new password</label><input className="input" id="required-confirm-password" type="password" value={values.confirmPassword} onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })} minLength="10" required /></div>
        {error && <div className="field-error">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
    </Modal>
  );
}

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="admin-layout">
      <AdminSidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && <button aria-label="Close navigation" onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 55, border: 0, background: 'rgba(20,35,24,.35)' }} />}
      <AdminTopbar onMenu={() => setMenuOpen(true)} />
      <main className="admin-content">
        <div className="admin-content-inner"><Outlet /></div>
      </main>
      <RequiredPasswordModal />
    </div>
  );
}
