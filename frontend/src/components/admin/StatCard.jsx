export function StatCard({ icon, label, value, trend, tone = 'secondary' }) {
  return (
    <article className="surface-card stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={tone === 'sky' ? { background: 'var(--sky-container)', color: '#29677f' } : tone === 'sun' ? { background: 'var(--warning-container)', color: 'var(--warning)' } : undefined}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && <span className="label-sm" style={{ color: 'var(--secondary)' }}>{trend}</span>}
      </div>
      <div className="label-sm uppercase muted">{label}</div>
      <div className="stat-value">{value}</div>
    </article>
  );
}
