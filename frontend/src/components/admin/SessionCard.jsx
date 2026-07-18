import { Link } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { CopyButton } from '../common/CopyButton';

export function SessionCard({ session, onOpen, onClose, onDelete }) {
  return (
    <article className="surface-card interactive session-card">
      <div className="session-card-header">
        <div>
          <StatusBadge status={session.status} />
          <h2 className="headline-md" style={{ margin: '12px 0 5px' }}>{session.title}</h2>
        </div>
        <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>landscape</span>
      </div>
      <p className="muted" style={{ flex: 1 }}>{session.description}</p>
      <div className="session-code">{session.publicCode}</div>
      <div className="session-meta">
        <div><div className="label-sm muted">Questions</div><strong>{session.questionCount}</strong></div>
        <div><div className="label-sm muted">Participants</div><strong>{session.participantCount}</strong></div>
      </div>
      <div className="card-actions">
        <Link className="btn btn-outline" to={`/admin/sessions/${session.sessionId}`}><span className="material-symbols-outlined">visibility</span>View</Link>
        <CopyButton value={`${window.location.origin}/join/${session.publicCode}`} label="Invite" className="btn btn-ghost" />
        {session.status === 'DRAFT' && <button className="btn btn-secondary" onClick={() => onOpen(session)}><span className="material-symbols-outlined">play_arrow</span>Open</button>}
        {session.status === 'OPEN' && <button className="btn btn-danger" onClick={() => onClose(session)}><span className="material-symbols-outlined">stop_circle</span>Close</button>}
        {session.status === 'DRAFT' && <button className="btn btn-ghost" onClick={() => onDelete(session)} aria-label={`Delete ${session.title}`}><span className="material-symbols-outlined">delete</span></button>}
      </div>
    </article>
  );
}
