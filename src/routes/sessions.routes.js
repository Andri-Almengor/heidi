import { Router } from 'express';
import { z } from 'zod';
import { callAppsScript } from '../services/appsScriptClient.js';
import { requireBearerToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sessionsRouter = Router();

const sessionCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  questionIds: z.array(z.string().trim().min(5).max(100)).optional().default([]),
}).strict();

const sessionUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar title o description.',
});

const sessionQuestionsSchema = z.object({
  questionIds: z.array(z.string().trim().min(5).max(100)),
}).strict();

sessionsRouter.use(requireBearerToken);

sessionsRouter.get('/', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.list', {
    includeDeleted: req.query.includeDeleted === 'true',
    status: String(req.query.status || ''),
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.get('/:sessionId', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.get', {
    sessionId: req.params.sessionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.post('/', validate(sessionCreateSchema), asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.create', req.body, req.authToken);
  res.status(201).json({ ok: true, data });
}));

sessionsRouter.patch('/:sessionId', validate(sessionUpdateSchema), asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.update', {
    sessionId: req.params.sessionId,
    ...req.body,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.put(
  '/:sessionId/questions',
  validate(sessionQuestionsSchema),
  asyncHandler(async (req, res) => {
    const data = await callAppsScript('sessions.setQuestions', {
      sessionId: req.params.sessionId,
      questionIds: req.body.questionIds,
    }, req.authToken);
    res.json({ ok: true, data });
  }),
);

sessionsRouter.post('/:sessionId/open', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.open', {
    sessionId: req.params.sessionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.post('/:sessionId/close', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.close', {
    sessionId: req.params.sessionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.delete('/:sessionId', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.delete', {
    sessionId: req.params.sessionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.get('/:sessionId/results', asyncHandler(async (req, res) => {
  const data = await callAppsScript('sessions.results', {
    sessionId: req.params.sessionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

sessionsRouter.get(
  '/:sessionId/participants/:participantId/answers',
  asyncHandler(async (req, res) => {
    const data = await callAppsScript('sessions.participantAnswers', {
      sessionId: req.params.sessionId,
      participantId: req.params.participantId,
    }, req.authToken);
    res.json({ ok: true, data });
  }),
);
