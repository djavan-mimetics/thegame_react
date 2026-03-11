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

  app.post('/v1/notifications/:id/seen', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const notificationId = (req.params as { id: string }).id;

    const res = await app.db.pool.query(
      `UPDATE notifications
       SET seen = true
       WHERE id = $1 AND user_id = $2
       RETURNING id, seen`,
      [notificationId, userId]
    );

    if (res.rowCount === 0) return reply.code(404).send({ error: 'not_found' });

    return reply.send({
      id: String(res.rows[0].id ?? ''),
      seen: Boolean(res.rows[0].seen)
    });
  });
}
