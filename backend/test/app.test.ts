import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app';

import 'dotenv/config';

process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-only-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
const server = createApp().listen(0);
let baseUrl = '';
let token = '';
const testEmail = `real.user.${Date.now()}@invalid.test`;

before(() => {
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test server did not start');
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

after(() => server.close());

test('rejects protected requests without credentials', async () => {
  const response = await fetch(`${baseUrl}/policies`);
  assert.equal(response.status, 401);
});

test('returns a usable login envelope', async () => {
  const registration = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'a-secure-password', firstName: 'Real', lastName: 'User', mobile: '+27000000000' })
  });
  assert.equal(registration.status, 201);
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'a-secure-password' })
  });
  const body = await response.json() as { success: boolean; data: { token: string; user: { role: string } } };
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.user.role, 'CLIENT');
  assert.ok(body.data.token);
  token = body.data.token;
});

test('scopes client policies to the authenticated client', async () => {
  const response = await fetch(`${baseUrl}/policies`, { headers: { authorization: `Bearer ${token}` } });
  const body = await response.json() as { data: Array<{ client_id: string }> };
  assert.equal(response.status, 200);
  assert.deepEqual(body.data, []);
});

test('rejects arbitrary client fields and incomplete payloads', async () => {
  const response = await fetch(`${baseUrl}/crm/clients`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ isAdmin: true })
  });
  assert.equal(response.status, 403);
});