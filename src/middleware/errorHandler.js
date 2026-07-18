import { HttpError } from '../utils/httpError.js';

export function errorHandler(error, req, res, _next) {
  const isKnown = error instanceof HttpError;
  const status = isKnown ? error.status : 500;
  const code = isKnown ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = isKnown
    ? error.message
    : 'Ocurrió un error inesperado en el servidor.';

  if (!isKnown) {
    console.error('[heidi-backend]', {
      method: req.method,
      path: req.originalUrl,
      error,
    });
  }

  res.status(status).json({
    ok: false,
    error: {
      code,
      message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
    timestamp: new Date().toISOString(),
  });
}
