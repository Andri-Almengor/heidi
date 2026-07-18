import { Router } from 'express';
import { z } from 'zod';
import { callAppsScript } from '../services/appsScriptClient.js';
import { requireBearerToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminRouter = Router();

const loginSchema = z.object({
  username: z.string().trim().min(2).max(80),
  password: z.string().min(6).max(200),
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(200),
  newPassword: z.string().min(10).max(200),
}).strict();

adminRouter.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const data = await callAppsScript('admin.login', req.body);
  res.json({ ok: true, data });
}));

adminRouter.use(requireBearerToken);

adminRouter.post('/logout', asyncHandler(async (req, res) => {
  const data = await callAppsScript('admin.logout', {}, req.authToken);
  res.json({ ok: true, data });
}));

adminRouter.get('/me', asyncHandler(async (req, res) => {
  const data = await callAppsScript('admin.me', {}, req.authToken);
  res.json({ ok: true, data });
}));

adminRouter.post(
  '/change-password',
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const data = await callAppsScript('admin.changePassword', req.body, req.authToken);
    res.json({ ok: true, data });
  }),
);
