import { createHttpError } from '../utils/httpError.js';

export function notFoundHandler(req, _res, next) {
  next(createHttpError(
    404,
    'ROUTE_NOT_FOUND',
    `No existe la ruta ${req.method} ${req.originalUrl}.`,
  ));
}
