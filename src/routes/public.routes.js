import { Router } from 'express';
import { z } from 'zod';
import { callAppsScript } from '../services/appsScriptClient.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicRouter = Router();

const joinSchema = z.object({
  guestName: z.string().trim().min(2).max(60),
}).strict();

publicRouter.get('/sessions/:publicCode', asyncHandler(async (req, res) => {
  const data = await callAppsScript('public.session', {
    publicCode: req.params.publicCode,
  });
  res.json({ ok: true, data });
}));

publicRouter.post(
  '/sessions/:publicCode/join',
  validate(joinSchema),
  asyncHandler(async (req, res) => {
    const data = await callAppsScript('guest.join', {
      publicCode: req.params.publicCode,
      guestName: req.body.guestName,
    });
    res.status(201).json({ ok: true, data });
  }),
);
