import { Link } from 'react-router-dom';

export function Brand({ to = '/', compact = false }) {
  return (
    <Link className="brand" to={to} aria-label="Heidi Quiz home">
      <span className="brand-mark" aria-hidden="true">
        <span className="material-symbols-outlined">landscape</span>
      </span>
      {!compact && <span>Heidi Quiz</span>}
    </Link>
  );
}
