import { createHttpError } from '../utils/httpError.js';

export function readBearerToken(req) {
  const authorization = String(req.headers.authorization || '').trim();
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function requireBearerToken(req, _res, next) {
  const token = readBearerToken(req);

  if (!token) {
    return next(createHttpError(
      401,
      'AUTH_REQUIRED',
      'Se requiere el encabezado Authorization: Bearer <token>.',
    ));
  }

  req.authToken = token;
  return next();
}
