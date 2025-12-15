import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('health', () => {
  it('GET /health returns 200', async () => {
    process.env.PORT = '0';
    process.env.HOST = '127.0.0.1';
    process.env.CORS_ORIGIN = '*';
    process.env.LOG_LEVEL = 'silent';
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://thegame:thegame@localhost:5432/thegame';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? '';

    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBeTypeOf('string');
    const payload = res.json();
    expect(payload.ok).toBe(true);

    if (process.env.SMOKE_DB === '1') {
      expect(payload.db).toBe('ok');
    }
    await app.close();
  });
});
