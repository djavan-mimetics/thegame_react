import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';

const matchQuery = `SELECT m.id,
  CASE WHEN m.user_a = $1 THEN m.user_b ELSE m.user_a END AS other_id
 FROM matches m
 WHERE m.user_a = $1 OR m.user_b = $1`;

export async function registerChatRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/chats', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const res = await app.db.pool.query(
      `WITH matches_for_user AS (${matchQuery})
       SELECT mf.id AS match_id,
              p.user_id,
              p.name,
              (SELECT COALESCE(public_url, gcs_path) FROM profile_photos ph WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL ORDER BY ph.order_index, ph.created_at LIMIT 1) AS image,
              (SELECT body FROM messages WHERE match_id = mf.id ORDER BY created_at DESC LIMIT 1) AS last_message,
              (SELECT created_at FROM messages WHERE match_id = mf.id ORDER BY created_at DESC LIMIT 1) AS timestamp,
              ARRAY(SELECT tag.label FROM profile_tags pt JOIN tags tag ON tag.id = pt.tag_id WHERE pt.user_id = p.user_id ORDER BY tag.sort_order, tag.id) AS tags,
              ARRAY(SELECT COALESCE(public_url, gcs_path) FROM profile_photos ph WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL ORDER BY ph.order_index, ph.created_at) AS images
       FROM matches_for_user mf
       JOIN profiles p ON p.user_id = mf.other_id
       ORDER BY timestamp DESC NULLS LAST, p.name`,
      [userId]
    );

    return {
      chats: res.rows.map((row) => ({
        id: String(row.match_id ?? ''),
        userId: String(row.user_id ?? ''),
        name: row.name ?? '',
        image: row.image ?? '',
        lastMessage: row.last_message || 'Sem mensagens ainda',
        timestamp: row.timestamp ? new Date(row.timestamp).toLocaleString('pt-BR') : '',
        unread: 0,
        tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
        images: Array.isArray(row.images) ? row.images.filter(Boolean) : []
      }))
    };
  });

  app.get('/v1/chats/:matchId/messages', { preHandler: app.requireAuth }, async (req, reply) => {
    const matchId = (req.params as { matchId: string }).matchId;
    const userId = req.user!.userId;

    const match = await app.db.pool.query(
      `SELECT 1 FROM matches WHERE id = $1 AND ($2 = user_a OR $2 = user_b)`,
      [matchId, userId]
    );
    if (match.rowCount === 0) return reply.code(403).send({ error: 'forbidden' });

    const res = await app.db.pool.query(
      `SELECT id, sender_id, body, created_at
       FROM messages
       WHERE match_id = $1
       ORDER BY created_at ASC
       LIMIT 200`,
      [matchId]
    );

    return {
      messages: res.rows.map((row) => ({
        id: row.id,
        senderId: row.sender_id,
        text: row.body,
        timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isMe: row.sender_id === userId
      }))
    };
  });

  const postSchema = z.object({
    text: z.string().min(1).max(2000)
  });

  app.post('/v1/chats/:matchId/messages', { preHandler: app.requireAuth }, async (req, reply) => {
    const matchId = (req.params as { matchId: string }).matchId;
    const userId = req.user!.userId;
    const body = postSchema.parse(req.body);

    const match = await app.db.pool.query(
      `SELECT 1 FROM matches WHERE id = $1 AND ($2 = user_a OR $2 = user_b)`,
      [matchId, userId]
    );
    if (match.rowCount === 0) return reply.code(403).send({ error: 'forbidden' });

    const res = await app.db.pool.query(
      `INSERT INTO messages (match_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [matchId, userId, body.text]
    );

    return reply.send({
      id: res.rows[0].id,
      senderId: userId,
      text: body.text,
      timestamp: new Date(res.rows[0].created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    });
  });
}
