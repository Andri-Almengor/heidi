export const STORAGE_KEYS = Object.freeze({
  adminToken: 'heidi_admin_token',
  adminUser: 'heidi_admin_user',
  guestToken: 'heidi_guest_token',
  guestParticipant: 'heidi_guest_participant',
  guestSession: 'heidi_guest_session',
});

export const SESSION_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  DELETED: 'DELETED',
});

export const PARTICIPANT_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
});

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
export const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS || 'false').toLowerCase() === 'true';
