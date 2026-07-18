import { API_URL, USE_MOCKS } from '../utils/constants';

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'The username or password is incorrect.',
  INVALID_CURRENT_PASSWORD: 'The current password is incorrect.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  INVALID_TOKEN: 'Your session is no longer valid. Please sign in again.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  TOKEN_REVOKED: 'Your session has been closed. Please sign in again.',
  QUESTION_NOT_FOUND: 'The question could not be found.',
  SESSION_NOT_FOUND: 'The session could not be found.',
  PARTICIPANT_NOT_FOUND: 'The participant could not be found.',
  SESSION_NOT_OPEN: 'This session is not open for participants.',
  SESSION_WITHOUT_QUESTIONS: 'Add at least one question before opening the session.',
  SESSION_NOT_DRAFT: 'Only draft sessions can be edited.',
  INVALID_SESSION_STATUS: 'This action is not available for the current session status.',
  QUIZ_ALREADY_COMPLETED: 'This quiz has already been completed.',
  QUESTION_NOT_IN_SESSION: 'This question does not belong to the session.',
  INVALID_OPTION: 'The selected answer is not valid.',
  WEAK_PASSWORD: 'Use at least 10 characters, including uppercase, lowercase, a number, and a symbol.',
  VALIDATION_ERROR: 'Please review the information and try again.',
  APPS_SCRIPT_UNAVAILABLE: 'The quiz service is temporarily unavailable.',
  APPS_SCRIPT_TIMEOUT: 'The quiz service took too long to respond.',
};

export class ApiError extends Error {
  constructor(message, code = 'REQUEST_FAILED', status = 500, details) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, signal, headers = {} } = options;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('The server returned an unreadable response.', 'INVALID_RESPONSE', response.status);
  }

  if (!response.ok || payload?.ok === false) {
    const code = payload?.error?.code || 'REQUEST_FAILED';
    const message = ERROR_MESSAGES[code] || payload?.error?.message || 'The request could not be completed.';
    throw new ApiError(message, code, response.status, payload?.error?.details);
  }

  return payload?.data ?? payload;
}

export function mockDelay(value, milliseconds = 220) {
  return new Promise((resolve) => window.setTimeout(() => resolve(structuredClone(value)), milliseconds));
}

export { USE_MOCKS };
