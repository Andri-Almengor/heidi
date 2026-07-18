import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDistPath = path.resolve(currentDirectory, '../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

function createHelmetOptions() {
  if (!env.SERVE_FRONTEND) {
    return undefined;
  }

  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        upgradeInsecureRequests: env.isProduction ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  };
}

export function createApp() {
  const app = express();

  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(helmet(createHelmetOptions()));
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

  if (env.SERVE_FRONTEND) {
    app.use(express.static(frontendDistPath, {
      index: false,
      maxAge: env.isProduction ? '1d' : 0,
      immutable: false,
    }));

    app.use((req, res, next) => {
      const isFrontendNavigation = req.method === 'GET'
        && !req.path.startsWith('/api')
        && Boolean(req.accepts('html'));

      if (!isFrontendNavigation) {
        return next();
      }

      return res.sendFile(frontendIndexPath, (error) => {
        if (error) {
          next(error);
        }
      });
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
