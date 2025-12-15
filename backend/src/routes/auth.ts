import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  consumePasswordResetToken,
  createEmailUser,
  createPasswordResetToken,
  createSession,
  findSessionByRefreshHash,
  findUserByEmail,
  findUserById,
  revokeSessionByRefreshHash,
  rotateSessionRefreshToken,
  updateUserPasswordHash,
  upsertEmailIdentity
} from '../auth/repo.js';
import { generateOpaqueToken, hashPassword, sha256Base64Url, verifyPassword } from '../auth/crypto.js';
import { signAccessToken } from '../auth/jwt.js';
import type { AppConfig } from '../config.js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerAuthRoutes(app: FastifyInstance, config: AppConfig) {
  const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(200)
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(200)
  });

  const refreshSchema = z.object({
    refreshToken: z.string().min(10)
  });

  const logoutSchema = z.object({
    refreshToken: z.string().min(10)
  });

  const forgotSchema = z.object({
    email: z.string().email()
  });

  const resetSchema = z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8).max(200)
  });

  const changeSchema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200)
  });

  app.post('/v1/auth/register', async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const email = normalizeEmail(body.email);

    const existing = await findUserByEmail(app.db, email);
    if (existing) return reply.code(409).send({ error: 'email_in_use' });

    const passwordHash = await hashPassword(body.password);
    const user = await createEmailUser(app.db, { email, passwordHash });
    await upsertEmailIdentity(app.db, { userId: user.id, providerSubject: email });

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = sha256Base64Url(refreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const session = await createSession(app.db, { userId: user.id, refreshTokenHash, expiresAt });

    const accessToken = await signAccessToken({
      secret: accessSecret,
      userId: user.id,
      ttlSeconds: config.JWT_ACCESS_TTL_SECONDS ?? 900
    });

    return reply.code(201).send({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
      sessionId: session.id
    });
  });

  app.post('/v1/auth/login', async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await findUserByEmail(app.db, email);
    if (!user || !user.password_hash) return reply.code(401).send({ error: 'invalid_credentials' });

    const ok = await verifyPassword(user.password_hash, body.password);
    if (!ok) return reply.code(401).send({ error: 'invalid_credentials' });
    if (user.status !== 'active') return reply.code(403).send({ error: 'user_blocked' });

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = sha256Base64Url(refreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const session = await createSession(app.db, { userId: user.id, refreshTokenHash, expiresAt });

    const accessToken = await signAccessToken({
      secret: accessSecret,
      userId: user.id,
      ttlSeconds: config.JWT_ACCESS_TTL_SECONDS ?? 900
    });

    return reply.send({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
      sessionId: session.id
    });
  });

  // Helps M1: rotate access token and refresh token (sliding session).
  app.post('/v1/auth/refresh', async (req, reply) => {
    const body = refreshSchema.parse(req.body);
    const refreshHash = sha256Base64Url(body.refreshToken);
    const session = await findSessionByRefreshHash(app.db, refreshHash);
    if (!session) return reply.code(401).send({ error: 'unauthorized' });
    if (session.revoked_at) return reply.code(401).send({ error: 'unauthorized' });
    if (new Date(session.expires_at).getTime() <= Date.now()) return reply.code(401).send({ error: 'unauthorized' });

    const user = await findUserById(app.db, session.user_id);
    if (!user || user.status !== 'active') return reply.code(401).send({ error: 'unauthorized' });

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const newRefreshToken = generateOpaqueToken();
    const newRefreshHash = sha256Base64Url(newRefreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const newExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const rotated = await rotateSessionRefreshToken(app.db, {
      sessionId: session.id,
      newRefreshTokenHash: newRefreshHash,
      newExpiresAt
    });
    if (!rotated) return reply.code(401).send({ error: 'unauthorized' });

    const accessToken = await signAccessToken({
      secret: accessSecret,
      userId: user.id,
      ttlSeconds: config.JWT_ACCESS_TTL_SECONDS ?? 900
    });
    return reply.send({ accessToken, refreshToken: newRefreshToken });
  });

  app.post('/v1/auth/logout', async (req, reply) => {
    const body = logoutSchema.parse(req.body);
    const refreshHash = sha256Base64Url(body.refreshToken);
    await revokeSessionByRefreshHash(app.db, refreshHash);
    return reply.send({ ok: true });
  });

  app.post('/v1/auth/forgot-password', async (req, reply) => {
    const body = forgotSchema.parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await findUserByEmail(app.db, email);

    // Always return 200 to avoid user enumeration.
    if (!user) return reply.send({ ok: true });

    const ttlMinutes = config.PASSWORD_RESET_TTL_MINUTES ?? 30;
    const token = generateOpaqueToken();
    const tokenHash = sha256Base64Url(token);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await createPasswordResetToken(app.db, { userId: user.id, tokenHash, expiresAt });

    // MVP: return token so the frontend can complete the flow in dev.
    // Production: send via email provider.
    return reply.send({ ok: true, token });
  });

  app.post('/v1/auth/reset-password', async (req, reply) => {
    const body = resetSchema.parse(req.body);
    const tokenHash = sha256Base64Url(body.token);
    const consumed = await consumePasswordResetToken(app.db, { tokenHash });
    if (!consumed) return reply.code(400).send({ error: 'invalid_or_expired_token' });

    const passwordHash = await hashPassword(body.newPassword);
    await updateUserPasswordHash(app.db, { userId: consumed.user_id, passwordHash });
    return reply.send({ ok: true });
  });

  app.post('/v1/auth/change-password', { preHandler: app.requireAuth }, async (req, reply) => {
    const body = changeSchema.parse(req.body);
    const userId = req.user!.userId;
    const user = await findUserById(app.db, userId);
    if (!user || !user.password_hash) return reply.code(401).send({ error: 'unauthorized' });

    const ok = await verifyPassword(user.password_hash, body.currentPassword);
    if (!ok) return reply.code(400).send({ error: 'invalid_current_password' });

    const passwordHash = await hashPassword(body.newPassword);
    await updateUserPasswordHash(app.db, { userId: user.id, passwordHash });
    return reply.send({ ok: true });
  });
}
