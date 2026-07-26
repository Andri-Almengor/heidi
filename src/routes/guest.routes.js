import { createHash } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { callAppsScript } from '../services/appsScriptClient.js';
import { requireBearerToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { runKeyedSerial } from '../utils/keyedSerialQueue.js';

export const guestRouter = Router();

const answerSchema = z.object({
  questionId: z.string().trim().min(5).max(100),
  selectedOptionId: z.string().trim().min(1).max(50),
}).strict();

function participantQueueKey(token) {
  return createHash('sha256').update(token).digest('hex');
}

guestRouter.use(requireBearerToken);

guestRouter.get('/quiz', asyncHandler(async (req, res) => {
  const data = await callAppsScript('guest.quiz', {}, req.authToken);
  res.json({ ok: true, data });
}));

guestRouter.post('/answers', validate(answerSchema), asyncHandler(async (req, res) => {
  // Only requests from the same participant are serialized. Different
  // participants continue in parallel, preventing lost progress updates.
  const data = await runKeyedSerial(
    participantQueueKey(req.authToken),
    () => callAppsScript('guest.answer', req.body, req.authToken),
  );
  res.status(data.alreadyAnswered ? 200 : 201).json({ ok: true, data });
}));

guestRouter.get('/progress', asyncHandler(async (req, res) => {
  const data = await callAppsScript('guest.progress', {}, req.authToken);
  res.json({ ok: true, data });
}));
