export function formatDate(value, options = {}) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', {
    dateStyle: options.dateStyle || 'medium',
    ...(options.withTime ? { timeStyle: 'short' } : {}),
  }).format(date);
}

export function initials(name = '') {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

export function clampPercent(value) {
  const number = Number(value) || 0;
  return Math.min(100, Math.max(0, number));
}

export function humanizeStatus(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function sessionJoinUrl(session) {
  if (session?.joinUrl) return session.joinUrl;
  if (!session?.publicCode) return '';
  return `${window.location.origin}/join/${encodeURIComponent(session.publicCode)}`;
}
