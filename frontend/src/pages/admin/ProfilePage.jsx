import { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useToast } from '../../components/common/ToastProvider';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, initials } from '../../utils/formatters';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user, updatePassword } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setError('');
    if (values.newPassword !== values.confirmPassword) { setError('The new passwords do not match.'); return; }
    setBusy(true);
    try { await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }); setValues({ currentPassword: '', newPassword: '', confirmPassword: '' }); showToast('Password updated successfully.', 'success'); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Administrator / Profile" title="Administrator Profile" description="Review your account and keep the mountain portal secure." />
      <div className="editor-layout">
        <section className="surface-card editor-section">
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 28 }}><div className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>{initials(user?.username)}</div><div><h2 className="headline-md" style={{ marginBottom: 3 }}>{user?.username}</h2><span className="badge badge-open">{user?.role || 'ADMIN'}</span></div></div>
          <div className="session-meta" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}><div><div className="label-sm muted">Account status</div><strong>{user?.active ? 'Active' : 'Inactive'}</strong></div><div><div className="label-sm muted">Last sign in</div><strong>{formatDate(user?.lastLoginAt, { withTime: true })}</strong></div><div><div className="label-sm muted">Created</div><strong>{formatDate(user?.createdAt)}</strong></div><div><div className="label-sm muted">Password policy</div><strong>{user?.mustChangePassword ? 'Change required' : 'Up to date'}</strong></div></div>
        </section>
        <section className="surface-card editor-section">
          <div className="section-title"><span className="material-symbols-outlined">lock_reset</span><h2 className="headline-md" style={{ marginBottom: 0 }}>Change password</h2></div>
          <form className="stack-md" onSubmit={submit}><div className="field"><label htmlFor="profile-current">Current password</label><input className="input" id="profile-current" type="password" value={values.currentPassword} onChange={(event) => setValues({ ...values, currentPassword: event.target.value })} required /></div><div className="field"><label htmlFor="profile-new">New password</label><input className="input" id="profile-new" type="password" value={values.newPassword} onChange={(event) => setValues({ ...values, newPassword: event.target.value })} minLength="10" required /><span className="label-sm muted">Use uppercase, lowercase, a number, and a symbol.</span></div><div className="field"><label htmlFor="profile-confirm">Confirm new password</label><input className="input" id="profile-confirm" type="password" value={values.confirmPassword} onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })} minLength="10" required /></div>{error && <div className="field-error">{error}</div>}<button className="btn btn-secondary" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button></form>
        </section>
      </div>
    </>
  );
}
