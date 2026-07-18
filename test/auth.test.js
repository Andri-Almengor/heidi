import test from 'node:test';
import assert from 'node:assert/strict';
import { readBearerToken } from '../src/middleware/auth.js';

test('readBearerToken obtiene un token Bearer', () => {
  const req = { headers: { authorization: 'Bearer abc123' } };
  assert.equal(readBearerToken(req), 'abc123');
});

test('readBearerToken ignora encabezados inválidos', () => {
  assert.equal(readBearerToken({ headers: { authorization: 'Basic abc' } }), '');
  assert.equal(readBearerToken({ headers: {} }), '');
});
