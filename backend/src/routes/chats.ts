import type { FastifyInstance } from 'fastify';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import type { AppConfig } from '../config.js';

const matchQuery = `SELECT m.id,
  CASE WHEN m.user_a = $1 THEN m.user_b ELSE m.user_a END AS other_id
 FROM matches m
 WHERE m.user_a = $1 OR m.user_b = $1`;

export async function registerChatRoutes(app: FastifyInstance, _config: AppConfig) {
  const rooms = new Map<string, Map<string, any>>();
  const accessSecret = _config.JWT_ACCESS_SECRET ?? '';
  const accessSecretBytes = new TextEncoder().encode(accessSecret);
  const messageRateLimit = {
    preHandler: app.requireAuth,
    config: {
      rateLimit: {
        max: 30,
        timeWindow: '1 minute'
      }
    }
  } as const;

  const parseWsToken = (rawUrl?: string) => {
    if (!rawUrl) return null;
    const fakeBase = 'http://localhost';
    const url = new URL(rawUrl, fakeBase);
    const token = url.searchParams.get('accessToken');
    return token && token.trim().length > 0 ? token : null;
  };

  const getWsUserId = async (rawUrl?: string) => {
    if (!accessSecret) return null;
    const token = parseWsToken(rawUrl);
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, accessSecretBytes);
      return typeof payload.sub === 'string' ? payload.sub : null;
    } catch {
      return null;
    }
  };

  const userBelongsToMatch = async (matchId: string, userId: string) => {
    const res = await app.db.pool.query(
      `SELECT 1 FROM matches WHERE id = $1 AND ($2 = user_a OR $2 = user_b)`,
      [matchId, userId]
    );
    return (res.rowCount ?? 0) > 0;
  };

  app.get('/v1/chats/:matchId/ws', { websocket: true }, async (connection, req) => {
    const matchId = (req.params as { matchId: string }).matchId;
    const userId = await getWsUserId(req.raw.url);

    if (!userId) {
      connection.socket.close(1008, 'unauthorized');
      return;
    }

    const allowed = await userBelongsToMatch(matchId, userId);
    if (!allowed) {
      connection.socket.close(1008, 'forbidden');
      return;
    }

    let room = rooms.get(matchId);
    if (!room) {
      room = new Map<string, any>();
      rooms.set(matchId, room);
    }
    room.set(userId, connection.socket);

    connection.socket.on('message', async (raw) => {
      let data: { type?: string; text?: string } | null = null;
      try {
        const parsed = JSON.parse(String(raw));
        data = parsed;
      } catch {
        return;
      }

      if (data?.type !== 'message') return;
      const parsedBody = z.object({ text: z.string().min(1).max(2000) }).safeParse({ text: data.text });
      if (!parsedBody.success) return;

      const res = await app.db.pool.query(
        `INSERT INTO messages (match_id, sender_id, body)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, body, created_at`,
        [matchId, userId, parsedBody.data.text]
      );
      const saved = res.rows[0];

      const sockets = rooms.get(matchId);
      if (!sockets || sockets.size === 0) return;

      for (const [targetUserId, socket] of sockets.entries()) {
        if (socket.readyState !== socket.OPEN) continue;
        socket.send(
          JSON.stringify({
            type: 'message',
            message: {
              id: String(saved.id ?? ''),
              senderId: String(saved.sender_id ?? ''),
              text: String(saved.body ?? ''),
              timestamp: new Date(saved.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              isMe: String(saved.sender_id ?? '') === targetUserId
            }
          })
        );
      }
    });

    connection.socket.on('close', () => {
      const currentRoom = rooms.get(matchId);
      if (!currentRoom) return;
      currentRoom.delete(userId);
      if (currentRoom.size === 0) rooms.delete(matchId);
    });
  });

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

  app.post('/v1/chats/:matchId/messages', messageRateLimit, async (req, reply) => {
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
