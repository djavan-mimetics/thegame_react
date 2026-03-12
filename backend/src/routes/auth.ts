import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  consumeEmailVerificationToken,
  consumePasswordResetToken,
  createEmailUser,
  createEmailVerificationToken,
  createPasswordResetToken,
  createSession,
  deleteUserById,
  findSessionByRefreshHash,
  findSessionByUsedRefreshHash,
  findUserByEmail,
  findUserById,
  markUserEmailVerified,
  recordRefreshToken,
  revokeSession,
  revokeSessionByRefreshHash,
  rotateSessionRefreshToken,
  updateUserPasswordHash,
  upsertEmailIdentity
} from '../auth/repo.js';
import { generateOpaqueToken, hashPassword, sha256Base64Url, verifyPassword } from '../auth/crypto.js';
import { signAccessToken } from '../auth/jwt.js';
import type { AppConfig } from '../config.js';
import { sendTransactionalEmail } from '../email/service.js';
import { buildPasswordResetEmail, buildWelcomeVerificationEmail } from '../email/templates.js';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerAuthRoutes(app: FastifyInstance, config: AppConfig) {
  const frontendBase = (config.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  } as const;
  const passwordRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '15 minutes'
      }
    }
  } as const;
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

  const verifyEmailSchema = z.object({
    token: z.string().min(10)
  });

  const changeSchema = z.object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z.string().min(8).max(200)
  });

  const deleteAccountSchema = z.object({
    currentPassword: z.string().min(1).max(200).optional()
  });

  const logAudit = async (
    action: string,
    req: Parameters<FastifyInstance['audit']['log']>[0]['request'],
    options?: {
      userId?: string | null;
      targetUserId?: string | null;
      metadata?: Record<string, unknown>;
    }
  ) => {
    try {
      await app.audit.log({
        action,
        request: req,
        userId: options?.userId,
        targetUserId: options?.targetUserId,
        metadata: options?.metadata
      });
    } catch (error) {
      req.log.error({ err: error, action }, 'audit_log_failed');
    }
  };

  app.post('/v1/auth/register', authRateLimit, async (req, reply) => {
    const body = registerSchema.parse(req.body);
    const email = normalizeEmail(body.email);

    const existing = await findUserByEmail(app.db, email);
    if (existing) {
      await logAudit('auth.register_conflict', req, { metadata: { email } });
      return reply.code(409).send({ error: 'email_in_use' });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await createEmailUser(app.db, { email, passwordHash });
    await upsertEmailIdentity(app.db, { userId: user.id, providerSubject: email });

    const verificationToken = generateOpaqueToken();
    const verificationTokenHash = sha256Base64Url(verificationToken);
    const verificationExpiresAt = new Date(Date.now() + (config.EMAIL_VERIFICATION_TTL_HOURS ?? 48) * 60 * 60 * 1000);
    await createEmailVerificationToken(app.db, {
      userId: user.id,
      tokenHash: verificationTokenHash,
      expiresAt: verificationExpiresAt
    });

    const verificationDelivery = await sendTransactionalEmail({
      config,
      logger: app.log,
      to: email,
      template: buildWelcomeVerificationEmail({
        confirmationUrl: `${frontendBase}/?verifyEmailToken=${encodeURIComponent(verificationToken)}`
      })
    });

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = sha256Base64Url(refreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const absoluteTtlDays = config.SESSION_ABSOLUTE_TTL_DAYS ?? 365;
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const absoluteExpiresAt = new Date(Date.now() + absoluteTtlDays * 24 * 60 * 60 * 1000);
    const session = await createSession(app.db, {
      userId: user.id,
      refreshTokenHash,
      expiresAt: absoluteExpiresAt < expiresAt ? absoluteExpiresAt : expiresAt,
      absoluteExpiresAt
    });

    const accessToken = await signAccessToken({
      secret: accessSecret,
      userId: user.id,
      ttlSeconds: config.JWT_ACCESS_TTL_SECONDS ?? 900
    });

    await logAudit('auth.register_success', req, {
      userId: user.id,
      targetUserId: user.id,
      metadata: { email, requiresEmailVerification: true }
    });

    try {
      await app.notifications.notifyWelcome({
        userId: user.id,
        requiresEmailVerification: true
      });
    } catch (error) {
      req.log.error({ err: error, userId: user.id }, 'system_notification_failed');
    }

    return reply.code(201).send({
      user: { id: user.id, email: user.email },
      accessToken,
      refreshToken,
      sessionId: session.id,
      requiresEmailVerification: true,
      verificationToken: verificationDelivery.previewTokenReturned ? verificationToken : undefined
    });
  });

  app.post('/v1/auth/login', authRateLimit, async (req, reply) => {
    const body = loginSchema.parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await findUserByEmail(app.db, email);
    if (!user || !user.password_hash) {
      await logAudit('auth.login_failed', req, { metadata: { email, reason: 'invalid_credentials' } });
      return reply.code(401).send({ error: 'invalid_credentials' });
    }

    const ok = await verifyPassword(user.password_hash, body.password);
    if (!ok) {
      await logAudit('auth.login_failed', req, {
        userId: user.id,
        targetUserId: user.id,
        metadata: { email, reason: 'invalid_credentials' }
      });
      return reply.code(401).send({ error: 'invalid_credentials' });
    }
    if (user.status !== 'active') {
      await logAudit('auth.login_blocked', req, {
        userId: user.id,
        targetUserId: user.id,
        metadata: { email, reason: 'user_blocked' }
      });
      return reply.code(403).send({ error: 'user_blocked' });
    }

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const refreshToken = generateOpaqueToken();
    const refreshTokenHash = sha256Base64Url(refreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const absoluteTtlDays = config.SESSION_ABSOLUTE_TTL_DAYS ?? 365;
    const expiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const absoluteExpiresAt = new Date(Date.now() + absoluteTtlDays * 24 * 60 * 60 * 1000);
    const session = await createSession(app.db, {
      userId: user.id,
      refreshTokenHash,
      expiresAt: absoluteExpiresAt < expiresAt ? absoluteExpiresAt : expiresAt,
      absoluteExpiresAt
    });

    const accessToken = await signAccessToken({
      secret: accessSecret,
      userId: user.id,
      ttlSeconds: config.JWT_ACCESS_TTL_SECONDS ?? 900
    });

    await logAudit('auth.login_success', req, {
      userId: user.id,
      targetUserId: user.id,
      metadata: { email, sessionId: session.id }
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
    if (!session) {
      const reused = await findSessionByUsedRefreshHash(app.db, refreshHash);
      if (reused) {
        await revokeSession(app.db, { sessionId: reused.session_id });
        return reply.code(401).send({ error: 'refresh_reuse' });
      }
      return reply.code(401).send({ error: 'unauthorized' });
    }
    if (session.revoked_at) return reply.code(401).send({ error: 'unauthorized' });
    if (new Date(session.expires_at).getTime() <= Date.now()) return reply.code(401).send({ error: 'unauthorized' });
    if (new Date(session.absolute_expires_at).getTime() <= Date.now()) return reply.code(401).send({ error: 'session_expired' });

    const user = await findUserById(app.db, session.user_id);
    if (!user || user.status !== 'active') return reply.code(401).send({ error: 'unauthorized' });

    const accessSecret = config.JWT_ACCESS_SECRET ?? '';
    if (!accessSecret) return reply.code(500).send({ error: 'server_misconfigured' });

    const newRefreshToken = generateOpaqueToken();
    const newRefreshHash = sha256Base64Url(newRefreshToken);
    const refreshTtlDays = config.REFRESH_TTL_DAYS ?? 30;
    const newExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    const cappedExpiresAt = newExpiresAt > session.absolute_expires_at ? session.absolute_expires_at : newExpiresAt;
    await recordRefreshToken(app.db, { sessionId: session.id, refreshTokenHash: refreshHash });
    const rotated = await rotateSessionRefreshToken(app.db, {
      sessionId: session.id,
      newRefreshTokenHash: newRefreshHash,
      newExpiresAt: cappedExpiresAt
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

  app.post('/v1/auth/forgot-password', passwordRateLimit, async (req, reply) => {
    const body = forgotSchema.parse(req.body);
    const email = normalizeEmail(body.email);
    const user = await findUserByEmail(app.db, email);

    // Always return 200 to avoid user enumeration.
    if (!user) {
      await logAudit('auth.password_reset_requested', req, {
        metadata: { email, userExists: false }
      });
      return reply.send({ ok: true });
    }

    const ttlMinutes = config.PASSWORD_RESET_TTL_MINUTES ?? 30;
    const token = generateOpaqueToken();
    const tokenHash = sha256Base64Url(token);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    await createPasswordResetToken(app.db, { userId: user.id, tokenHash, expiresAt });

    const delivery = await sendTransactionalEmail({
      config,
      logger: app.log,
      to: email,
      template: buildPasswordResetEmail({
        resetUrl: `${frontendBase}/?resetPasswordToken=${encodeURIComponent(token)}`,
        expiresInMinutes: ttlMinutes
      })
    });

    await logAudit('auth.password_reset_requested', req, {
      userId: user.id,
      targetUserId: user.id,
      metadata: { email, userExists: true }
    });

    return reply.send({ ok: true, token: delivery.previewTokenReturned ? token : undefined });
  });

  app.post('/v1/auth/verify-email', passwordRateLimit, async (req, reply) => {
    const body = verifyEmailSchema.parse(req.body);
    const tokenHash = sha256Base64Url(body.token);
    const consumed = await consumeEmailVerificationToken(app.db, { tokenHash });
    if (!consumed) {
      await logAudit('auth.email_verification_failed', req, {
        metadata: { reason: 'invalid_or_expired_token' }
      });
      return reply.code(400).send({ error: 'invalid_or_expired_token' });
    }

    await markUserEmailVerified(app.db, { userId: consumed.user_id });
    await logAudit('auth.email_verified', req, {
      userId: consumed.user_id,
      targetUserId: consumed.user_id
    });
    try {
      await app.notifications.notifyEmailVerified({ userId: consumed.user_id });
    } catch (error) {
      req.log.error({ err: error, userId: consumed.user_id }, 'system_notification_failed');
    }
    return reply.send({ ok: true });
  });

  app.post('/v1/auth/reset-password', passwordRateLimit, async (req, reply) => {
    const body = resetSchema.parse(req.body);
    const tokenHash = sha256Base64Url(body.token);
    const consumed = await consumePasswordResetToken(app.db, { tokenHash });
    if (!consumed) {
      await logAudit('auth.password_reset_failed', req, {
        metadata: { reason: 'invalid_or_expired_token' }
      });
      return reply.code(400).send({ error: 'invalid_or_expired_token' });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await updateUserPasswordHash(app.db, { userId: consumed.user_id, passwordHash });
    await logAudit('auth.password_reset_success', req, {
      userId: consumed.user_id,
      targetUserId: consumed.user_id
    });
    try {
      await app.notifications.notifyPasswordChanged({ userId: consumed.user_id, source: 'reset' });
    } catch (error) {
      req.log.error({ err: error, userId: consumed.user_id }, 'system_notification_failed');
    }
    return reply.send({ ok: true });
  });

  app.post('/v1/auth/change-password', { preHandler: app.requireAuth, ...passwordRateLimit }, async (req, reply) => {
    const body = changeSchema.parse(req.body);
    const userId = req.user!.userId;
    const user = await findUserById(app.db, userId);
    if (!user || !user.password_hash) return reply.code(401).send({ error: 'unauthorized' });

    const ok = await verifyPassword(user.password_hash, body.currentPassword);
    if (!ok) {
      await logAudit('auth.change_password_failed', req, {
        userId,
        targetUserId: userId,
        metadata: { reason: 'invalid_current_password' }
      });
      return reply.code(400).send({ error: 'invalid_current_password' });
    }

    const passwordHash = await hashPassword(body.newPassword);
    await updateUserPasswordHash(app.db, { userId: user.id, passwordHash });
    await logAudit('auth.change_password_success', req, {
      userId,
      targetUserId: userId
    });
    try {
      await app.notifications.notifyPasswordChanged({ userId, source: 'change' });
    } catch (error) {
      req.log.error({ err: error, userId }, 'system_notification_failed');
    }
    return reply.send({ ok: true });
  });

  app.post('/v1/auth/delete-account', { preHandler: app.requireAuth, ...passwordRateLimit }, async (req, reply) => {
    const body = deleteAccountSchema.parse(req.body ?? {});
    const userId = req.user!.userId;
    const user = await findUserById(app.db, userId);
    if (!user) return reply.code(401).send({ error: 'unauthorized' });

    if (user.password_hash) {
      if (!body.currentPassword) return reply.code(400).send({ error: 'password_required' });
      const valid = await verifyPassword(user.password_hash, body.currentPassword);
      if (!valid) {
        await logAudit('auth.delete_account_failed', req, {
          userId,
          targetUserId: userId,
          metadata: { reason: 'invalid_current_password' }
        });
        return reply.code(400).send({ error: 'invalid_current_password' });
      }
    }

    await logAudit('auth.delete_account_requested', req, {
      userId,
      targetUserId: userId
    });
    await deleteUserById(app.db, { userId });
    return reply.send({ ok: true });
  });
}
