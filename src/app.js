import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { adminRouter } from './routes/admin.routes.js';
import { questionsRouter } from './routes/questions.routes.js';
import { sessionsRouter } from './routes/sessions.routes.js';
import { publicRouter } from './routes/public.routes.js';
import { guestRouter } from './routes/guest.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createHttpError } from './utils/httpError.js';

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));

  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes('*') || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(createHttpError(403, 'CORS_NOT_ALLOWED', 'El origen no está autorizado.'));
    },
    credentials: true,
  }));

  const generalLimiter = rateLimit({
    windowMs: 60_000,
    limit: 180,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  const loginLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      ok: false,
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message: 'Demasiados intentos de inicio de sesión. Intente más tarde.',
      },
    },
  });

  const joinLimiter = rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  });

  app.use(generalLimiter);
  app.use('/api/health', healthRouter);
  app.use('/api/admin/login', loginLimiter);
  app.use('/api/admin', adminRouter);
  app.use('/api/admin/questions', questionsRouter);
  app.use('/api/admin/sessions', sessionsRouter);
  app.use('/api/public/sessions/:publicCode/join', joinLimiter);
  app.use('/api/public', publicRouter);
  app.use('/api/guest', guestRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
