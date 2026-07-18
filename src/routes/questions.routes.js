import { Router } from 'express';
import { z } from 'zod';
import { callAppsScript } from '../services/appsScriptClient.js';
import { requireBearerToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const questionsRouter = Router();

const optionSchema = z.object({
  id: z.string().trim().min(1).max(50),
  text: z.string().trim().min(1).max(500),
}).strict();

const questionCreateSchema = z.object({
  questionText: z.string().trim().min(2).max(3000),
  options: z.array(optionSchema).min(2).max(8),
  correctOptionId: z.string().trim().min(1).max(50),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional().default(''),
  imageContext: z.string().trim().max(3000).optional().default(''),
}).strict().superRefine((value, context) => {
  const optionIds = value.options.map((option) => option.id);
  if (new Set(optionIds).size !== optionIds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['options'], message: 'Los ID de las opciones deben ser únicos.' });
  }
  if (!optionIds.includes(value.correctOptionId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['correctOptionId'], message: 'La respuesta correcta debe pertenecer a las opciones.' });
  }
});

const questionUpdateSchema = z.object({
  questionText: z.string().trim().min(2).max(3000).optional(),
  options: z.array(optionSchema).min(2).max(8).optional(),
  correctOptionId: z.string().trim().min(1).max(50).optional(),
  imageUrl: z.union([z.string().trim().url(), z.literal('')]).optional(),
  imageContext: z.string().trim().max(3000).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar.',
});

questionsRouter.use(requireBearerToken);

questionsRouter.get('/', asyncHandler(async (req, res) => {
  const data = await callAppsScript('questions.list', {
    includeInactive: req.query.includeInactive === 'true',
    search: String(req.query.search || ''),
  }, req.authToken);
  res.json({ ok: true, data });
}));

questionsRouter.get('/:questionId', asyncHandler(async (req, res) => {
  const data = await callAppsScript('questions.get', {
    questionId: req.params.questionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));

questionsRouter.post('/', validate(questionCreateSchema), asyncHandler(async (req, res) => {
  const data = await callAppsScript('questions.create', req.body, req.authToken);
  res.status(201).json({ ok: true, data });
}));

questionsRouter.put('/:questionId', validate(questionUpdateSchema), asyncHandler(async (req, res) => {
  const data = await callAppsScript('questions.update', {
    questionId: req.params.questionId,
    ...req.body,
  }, req.authToken);
  res.json({ ok: true, data });
}));

questionsRouter.delete('/:questionId', asyncHandler(async (req, res) => {
  const data = await callAppsScript('questions.delete', {
    questionId: req.params.questionId,
  }, req.authToken);
  res.json({ ok: true, data });
}));
