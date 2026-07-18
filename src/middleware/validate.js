import { createHttpError } from '../utils/httpError.js';

export function validate(schema, source = 'body') {
  return function validationMiddleware(req, _res, next) {
    const parsed = schema.safeParse(req[source]);

    if (!parsed.success) {
      return next(createHttpError(
        400,
        'VALIDATION_ERROR',
        'Los datos enviados no son válidos.',
        parsed.error.flatten(),
      ));
    }

    req[source] = parsed.data;
    return next();
  };
}
