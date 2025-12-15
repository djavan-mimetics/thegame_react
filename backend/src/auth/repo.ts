import type { Db } from '../db.js';

export type DbUser = {
  id: string;
  email: string;
  password_hash: string | null;
  status: string;
};

export async function findUserByEmail(db: Db, email: string): Promise<DbUser | null> {
  const res = await db.pool.query(
    'SELECT id, email, password_hash, status FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return (res.rows[0] as DbUser | undefined) ?? null;
}

export async function findUserById(db: Db, userId: string): Promise<DbUser | null> {
  const res = await db.pool.query(
    'SELECT id, email, password_hash, status FROM users WHERE id = $1 LIMIT 1',
    [userId]
  );
  return (res.rows[0] as DbUser | undefined) ?? null;
}

export async function createEmailUser(db: Db, input: { email: string; passwordHash: string }): Promise<DbUser> {
  const res = await db.pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash, status',
    [input.email, input.passwordHash]
  );
  return res.rows[0] as DbUser;
}

export async function upsertEmailIdentity(db: Db, input: { userId: string; providerSubject: string }) {
  await db.pool.query(
    `INSERT INTO user_identities (user_id, provider, provider_subject)
     VALUES ($1, 'email', $2)
     ON CONFLICT (user_id, provider) DO UPDATE SET provider_subject = EXCLUDED.provider_subject`,
    [input.userId, input.providerSubject]
  );
}

export async function createSession(db: Db, input: { userId: string; refreshTokenHash: string; expiresAt: Date }) {
  const res = await db.pool.query(
    `INSERT INTO sessions (user_id, refresh_token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [input.userId, input.refreshTokenHash, input.expiresAt]
  );
  return res.rows[0] as { id: string };
}

export async function revokeSession(db: Db, input: { sessionId: string }) {
  await db.pool.query('UPDATE sessions SET revoked_at = now() WHERE id = $1', [input.sessionId]);
}

export async function revokeSessionByRefreshHash(db: Db, refreshHash: string) {
  await db.pool.query('UPDATE sessions SET revoked_at = now() WHERE refresh_token_hash = $1', [refreshHash]);
}

export async function findSessionByRefreshHash(db: Db, refreshHash: string) {
  const res = await db.pool.query(
    `SELECT id, user_id, expires_at, revoked_at
     FROM sessions
     WHERE refresh_token_hash = $1
     LIMIT 1`,
    [refreshHash]
  );
  return (res.rows[0] as { id: string; user_id: string; expires_at: Date; revoked_at: Date | null } | undefined) ?? null;
}

export async function rotateSessionRefreshToken(db: Db, input: {
  sessionId: string;
  newRefreshTokenHash: string;
  newExpiresAt: Date;
}) {
  const res = await db.pool.query(
    `UPDATE sessions
     SET refresh_token_hash = $2,
         expires_at = $3
     WHERE id = $1
       AND revoked_at IS NULL
     RETURNING id`,
    [input.sessionId, input.newRefreshTokenHash, input.newExpiresAt]
  );
  return (res.rows[0] as { id: string } | undefined) ?? null;
}

export async function createPasswordResetToken(db: Db, input: { userId: string; tokenHash: string; expiresAt: Date }) {
  const res = await db.pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [input.userId, input.tokenHash, input.expiresAt]
  );
  return res.rows[0] as { id: string };
}

export async function consumePasswordResetToken(db: Db, input: { tokenHash: string }) {
  const res = await db.pool.query(
    `UPDATE password_reset_tokens
     SET consumed_at = now()
     WHERE token_hash = $1
       AND consumed_at IS NULL
       AND expires_at > now()
     RETURNING user_id`,
    [input.tokenHash]
  );
  return (res.rows[0] as { user_id: string } | undefined) ?? null;
}

export async function updateUserPasswordHash(db: Db, input: { userId: string; passwordHash: string }) {
  await db.pool.query('UPDATE users SET password_hash = $2 WHERE id = $1', [input.userId, input.passwordHash]);
}
