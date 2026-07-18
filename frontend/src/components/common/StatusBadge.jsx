import { humanizeStatus } from '../../utils/formatters';

export function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{humanizeStatus(status)}</span>;
}
