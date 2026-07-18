import { useEffect } from 'react';

export function Modal({ open, title, children, footer = null, onClose = () => {}, closeDisabled = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && !closeDisabled) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, closeDisabled]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !closeDisabled) onClose?.();
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h2 className="headline-md" style={{ marginBottom: 0 }}>{title}</h2>
          {!closeDisabled && <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><span className="material-symbols-outlined">close</span></button>}
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
