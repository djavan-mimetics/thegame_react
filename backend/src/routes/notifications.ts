import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function registerNotificationsRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/notifications', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const res = await app.db.pool.query(
      `SELECT id, type, title, description, created_at, seen
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    return {
      notifications: res.rows.map((row) => ({
        id: String(row.id ?? ''),
        type: row.type ?? 'system',
        title: row.title ?? 'Atualizacao',
        description: row.description ?? '',
        timestamp: row.created_at ? new Date(row.created_at).toLocaleString('pt-BR') : '',
        seen: row.seen ?? false
      }))
    };
  });
}
