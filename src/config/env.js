import 'dotenv/config';
import { z } from 'zod';

const booleanFromEnv = z
  .union([z.string(), z.number(), z.boolean()])
  .transform((value) => ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase()));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APPS_SCRIPT_URL: z.string().url().refine(
    (value) => value.includes('script.google.com/macros/s/') && value.endsWith('/exec'),
    'APPS_SCRIPT_URL debe ser la URL /exec de una aplicación web de Apps Script.',
  ),
  APPS_SCRIPT_API_KEY: z.string().min(20, 'APPS_SCRIPT_API_KEY no parece válida.'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
  APPS_SCRIPT_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(25000),
  TRUST_PROXY: booleanFromEnv.default(false),
  SERVE_FRONTEND: booleanFromEnv.default(false),
  RENDER_EXTERNAL_HOSTNAME: z.string().trim().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Configuración de entorno inválida:\n${details}`);
}

const allowedOrigins = parsed.data.CORS_ORIGINS
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (parsed.data.RENDER_EXTERNAL_HOSTNAME) {
  allowedOrigins.push(`https://${parsed.data.RENDER_EXTERNAL_HOSTNAME}`);
}

export const env = Object.freeze({
  ...parsed.data,
  allowedOrigins: [...new Set(allowedOrigins)],
  isProduction: parsed.data.NODE_ENV === 'production',
});
