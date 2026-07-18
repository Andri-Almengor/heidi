export function LoadingState({ message = 'Loading the trail…' }) {
  return <div className="loading-state"><div><div className="spinner" style={{ margin: '0 auto 16px' }} /><p className="muted">{message}</p></div></div>;
}

export function EmptyState({ icon = 'eco', title = 'Nothing here yet', message = 'The next chapter can begin whenever you are ready.', action = null }) {
  return <div className="empty-state"><div><div className="state-icon"><span className="material-symbols-outlined">{icon}</span></div><h3 className="headline-md">{title}</h3><p className="muted">{message}</p>{action}</div></div>;
}

export function ErrorState({ title = 'The path is temporarily blocked', message = '', onRetry = null }) {
  return <div className="error-state"><div><div className="state-icon" style={{ background: 'var(--error-container)', color: 'var(--error)' }}><span className="material-symbols-outlined">error</span></div><h3 className="headline-md">{title}</h3><p className="muted">{message || 'Please try again in a moment.'}</p>{onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}</div></div>;
}
