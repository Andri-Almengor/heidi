import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { callAppsScript } from '../services/appsScriptClient.js';

export const healthRouter = Router();

healthRouter.get('/live', (_req, res) => {
  res.json({
    ok: true,
    service: 'Heidi Quiz Backend',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get('/', asyncHandler(async (_req, res) => {
  const upstream = await callAppsScript('health');
  res.json({
    ok: true,
    service: 'Heidi Quiz Backend',
    status: 'online',
    upstream,
    timestamp: new Date().toISOString(),
  });
}));
