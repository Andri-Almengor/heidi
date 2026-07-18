import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TEST_DEPLOYMENT/exec';
process.env.APPS_SCRIPT_API_KEY = 'test-api-key-with-more-than-twenty-characters';
process.env.CORS_ORIGINS = '*';
process.env.TRUST_PROXY = '0';

const originalFetch = globalThis.fetch;
const upstreamRequests = [];

globalThis.fetch = async (url, options = {}) => {
  if (String(url).startsWith('https://script.google.com/')) {
    const request = JSON.parse(options.body || '{}');
    upstreamRequests.push(request);

    if (request.action === 'admin.login') {
      return new Response(JSON.stringify({
        ok: true,
        data: {
          token: 'admin-token',
          expiresAt: '2026-07-18T12:00:00.000Z',
          user: { username: 'admin', role: 'ADMIN', mustChangePassword: true },
        },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (request.action === 'questions.list') {
      return new Response(JSON.stringify({
        ok: true,
        data: { questions: [], total: 0 },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      ok: true,
      data: { service: 'Heidi Quiz', status: 'online' },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  return originalFetch(url, options);
};

const { createApp } = await import('../src/app.js');

async function withServer(run) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test('login administrativo oculta la API key al cliente y la envía a Apps Script', async () => {
  upstreamRequests.length = 0;

  await withServer(async (baseUrl) => {
    const response = await originalFetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'HeidiAdmin#2026!' }),
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.data.token, 'admin-token');
    assert.equal('apiKey' in payload, false);
    assert.equal(upstreamRequests[0].action, 'admin.login');
    assert.equal(upstreamRequests[0].apiKey, process.env.APPS_SCRIPT_API_KEY);
  });
});

test('las rutas administrativas requieren Bearer token', async () => {
  upstreamRequests.length = 0;

  await withServer(async (baseUrl) => {
    const unauthorized = await originalFetch(`${baseUrl}/api/admin/questions`);
    const unauthorizedPayload = await unauthorized.json();

    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorizedPayload.error.code, 'AUTH_REQUIRED');
    assert.equal(upstreamRequests.length, 0);

    const authorized = await originalFetch(`${baseUrl}/api/admin/questions`, {
      headers: { authorization: 'Bearer admin-token' },
    });
    const authorizedPayload = await authorized.json();

    assert.equal(authorized.status, 200);
    assert.equal(authorizedPayload.data.total, 0);
    assert.equal(upstreamRequests[0].token, 'admin-token');
  });
});

test.after(() => {
  globalThis.fetch = originalFetch;
});
