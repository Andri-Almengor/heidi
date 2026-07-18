import { clampPercent } from '../../utils/formatters';

export function ProgressBar({ value, label }) {
  const percent = clampPercent(value);
  return (
    <div>
      {label && <div className="label-sm muted" style={{ marginBottom: 6 }}>{label}</div>}
      <div className="progress-track" aria-label={label || 'Progress'} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent} role="progressbar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
