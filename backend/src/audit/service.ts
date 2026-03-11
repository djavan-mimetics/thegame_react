import type { FastifyRequest } from 'fastify';
import type { Db } from '../db.js';

type AuditLogInput = {
  action: string;
  request: FastifyRequest;
  userId?: string | null;
  targetUserId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export function createAuditService(db: Db) {
  return {
    async log(input: AuditLogInput) {
      await db.pool.query(
        `INSERT INTO audit_logs (
          actor_user_id,
          target_user_id,
          action,
          request_id,
          ip_address,
          user_agent,
          metadata,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, now())`,
        [
          input.userId ?? null,
          input.targetUserId ?? null,
          input.action,
          input.request.id,
          input.request.ip,
          input.request.headers['user-agent'] ?? null,
          JSON.stringify(input.metadata ?? {})
        ]
      );
    }
  };
}
