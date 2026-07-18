export function PageHeader({ eyebrow, title, description, actions = null }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <div className="breadcrumbs">{eyebrow}</div>}
        <h1 className="headline-lg" style={{ marginBottom: 6 }}>{title}</h1>
        {description && <p className="muted" style={{ marginBottom: 0 }}>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
