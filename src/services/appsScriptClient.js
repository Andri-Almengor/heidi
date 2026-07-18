import { env } from '../config/env.js';
import { createHttpError } from '../utils/httpError.js';

const ERROR_STATUS = Object.freeze({
  INVALID_API_KEY: 502,
  INVALID_CREDENTIALS: 401,
  INVALID_CURRENT_PASSWORD: 401,
  AUTH_REQUIRED: 401,
  INVALID_TOKEN: 401,
  INVALID_TOKEN_TYPE: 403,
  TOKEN_EXPIRED: 401,
  TOKEN_REVOKED: 401,
  USER_NOT_FOUND: 404,
  QUESTION_NOT_FOUND: 404,
  SESSION_NOT_FOUND: 404,
  PARTICIPANT_NOT_FOUND: 404,
  PARTICIPANT_SESSION_MISMATCH: 409,
  ROUTE_NOT_FOUND: 404,
  UNKNOWN_ACTION: 404,
  QUESTION_INACTIVE: 409,
  SESSION_NOT_DRAFT: 409,
  INVALID_SESSION_STATUS: 409,
  SESSION_WITHOUT_QUESTIONS: 409,
  SESSION_HAS_PARTICIPANTS: 409,
  SESSION_NOT_OPEN: 409,
  QUIZ_ALREADY_COMPLETED: 409,
  QUESTION_NOT_IN_SESSION: 409,
  INVALID_OPTION: 400,
  INVALID_BODY: 400,
  INVALID_JSON: 400,
  INVALID_OPTIONS: 400,
  INVALID_OPTIONS_COUNT: 400,
  INVALID_OPTION_ID: 400,
  DUPLICATE_OPTION_ID: 400,
  INVALID_CORRECT_OPTION: 400,
  INVALID_QUESTION_IDS: 400,
  INVALID_URL: 400,
  WEAK_PASSWORD: 400,
  VALIDATION_ERROR: 400,
  INVALID_REQUEST: 400,
  METHOD_NOT_ALLOWED: 405,
});

function statusForAppsScriptError(code) {
  return ERROR_STATUS[code] || 400;
}

export async function callAppsScript(action, data = {}, token = '') {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.APPS_SCRIPT_TIMEOUT_MS);

  try {
    const response = await fetch(env.APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        action,
        apiKey: env.APPS_SCRIPT_API_KEY,
        ...(token ? { token } : {}),
        data,
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    let payload;

    try {
      payload = JSON.parse(rawText);
    } catch {
      throw createHttpError(
        502,
        'APPS_SCRIPT_INVALID_RESPONSE',
        'Apps Script devolvió una respuesta que no es JSON.',
      );
    }

    if (!response.ok) {
      throw createHttpError(
        502,
        'APPS_SCRIPT_HTTP_ERROR',
        `Apps Script respondió con HTTP ${response.status}.`,
      );
    }

    if (!payload?.ok) {
      const code = payload?.error?.code || payload?.code || 'APPS_SCRIPT_ERROR';
      const message = payload?.error?.message || payload?.message || 'Apps Script rechazó la solicitud.';
      const details = payload?.error?.details || payload?.details;
      throw createHttpError(statusForAppsScriptError(code), code, message, details);
    }

    return payload.data ?? payload;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createHttpError(
        504,
        'APPS_SCRIPT_TIMEOUT',
        'Apps Script tardó demasiado en responder.',
      );
    }

    if (error?.status) {
      throw error;
    }

    throw createHttpError(
      502,
      'APPS_SCRIPT_UNAVAILABLE',
      'No fue posible comunicarse con Google Apps Script.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
