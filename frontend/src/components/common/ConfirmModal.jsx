import { Modal } from './Modal';

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, busy = false, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button><button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button></>}>
      <p className="muted" style={{ marginBottom: 0 }}>{message}</p>
    </Modal>
  );
}
