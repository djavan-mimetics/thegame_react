import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

const isDbSmoke = process.env.SMOKE_DB === '1';

describe('M1 auth smoketests', () => {
  it.skipIf(!isDbSmoke)('register/login/forgot/reset/change-password', async () => {
    process.env.PORT = '0';
    process.env.HOST = '127.0.0.1';
    process.env.CORS_ORIGIN = '*';
    process.env.LOG_LEVEL = 'silent';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-secret';
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://thegame:thegame@localhost:5432/thegame';

    const app = await buildApp();

    const email = `u${Date.now()}@example.com`;
    const password = 'Password#1234';

    const reg = await app.inject({
      method: 'POST',
      url: '/v1/auth/register',
      payload: { email, password }
    });
    expect(reg.statusCode).toBe(201);
    const regJson = reg.json();
    expect(regJson.accessToken).toBeTypeOf('string');
    expect(regJson.refreshToken).toBeTypeOf('string');

    const login = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email, password }
    });
    expect(login.statusCode).toBe(200);
    const loginJson = login.json();
    expect(loginJson.accessToken).toBeTypeOf('string');
    expect(loginJson.refreshToken).toBeTypeOf('string');

    const refreshed = await app.inject({
      method: 'POST',
      url: '/v1/auth/refresh',
      payload: { refreshToken: loginJson.refreshToken }
    });
    expect(refreshed.statusCode).toBe(200);
    const refreshedJson = refreshed.json();
    expect(refreshedJson.accessToken).toBeTypeOf('string');
    expect(refreshedJson.refreshToken).toBeTypeOf('string');

    const changeBad = await app.inject({
      method: 'POST',
      url: '/v1/auth/change-password',
      headers: { authorization: `Bearer ${loginJson.accessToken}` },
      payload: { currentPassword: 'wrong', newPassword: 'Password#5678' }
    });
    expect(changeBad.statusCode).toBe(400);

    const newPassword = 'Password#5678';
    const changeOk = await app.inject({
      method: 'POST',
      url: '/v1/auth/change-password',
      headers: { authorization: `Bearer ${loginJson.accessToken}` },
      payload: { currentPassword: password, newPassword }
    });
    expect(changeOk.statusCode).toBe(200);

    const forgot = await app.inject({
      method: 'POST',
      url: '/v1/auth/forgot-password',
      payload: { email }
    });
    expect(forgot.statusCode).toBe(200);
    const forgotJson = forgot.json();
    expect(forgotJson.ok).toBe(true);
    expect(forgotJson.token).toBeTypeOf('string');

    const resetPassword = 'Password#9999';
    const reset = await app.inject({
      method: 'POST',
      url: '/v1/auth/reset-password',
      payload: { token: forgotJson.token, newPassword: resetPassword }
    });
    expect(reset.statusCode).toBe(200);

    const loginAfterReset = await app.inject({
      method: 'POST',
      url: '/v1/auth/login',
      payload: { email, password: resetPassword }
    });
    expect(loginAfterReset.statusCode).toBe(200);

    const logout = await app.inject({
      method: 'POST',
      url: '/v1/auth/logout',
      payload: { refreshToken: refreshedJson.refreshToken }
    });
    expect(logout.statusCode).toBe(200);

    const refreshAfterLogout = await app.inject({
      method: 'POST',
      url: '/v1/auth/refresh',
      payload: { refreshToken: refreshedJson.refreshToken }
    });
    expect(refreshAfterLogout.statusCode).toBe(401);

    await app.close();
  });
});
