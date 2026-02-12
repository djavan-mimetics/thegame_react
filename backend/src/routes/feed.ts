import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

const toPublicProfile = (row: any) => ({
  id: String(row.id ?? ''),
  name: row.name ?? '',
  birthDate: row.birth_date ?? null,
  age: Number(row.age ?? 0),
  bio: row.bio ?? '',
  distance: Number(row.distance ?? 0),
  images: Array.isArray(row.images) ? row.images.filter(Boolean) : [],
  tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
  currentTag: row.current_tag ?? undefined,
  classification: row.classification ?? undefined,
  billSplit: row.bill_split ?? undefined,
  availableToday: typeof row.available_today === 'boolean' ? row.available_today : undefined,
  rankingScore: Number(row.ranking_score ?? 0),
  height: row.height_cm ? `${row.height_cm} cm` : undefined,
  education: row.education ?? undefined,
  relationship: row.relationship ?? undefined,
  family: row.family ?? undefined,
  drink: row.drink ?? undefined,
  smoke: row.smoke ?? undefined,
  pets: row.pets ?? undefined,
  exercise: row.exercise ?? undefined,
  food: row.food ?? undefined,
  sleep: row.sleep ?? undefined,
  personality: Array.isArray(row.personality) ? row.personality.filter(Boolean) : [],
  lookingFor: Array.isArray(row.looking_for) ? row.looking_for.filter(Boolean) : []
});

export async function registerFeedRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/feed', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const { cursor, limit } = req.query as { cursor?: string; limit?: string };
    const pageSize = Math.min(Math.max(Number(limit ?? 20), 1), 50);

    let cursorUpdatedAt: string | null = null;
    let cursorUserId: string | null = null;
    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
        const [updatedAt, id] = decoded.split('|');
        cursorUpdatedAt = updatedAt ?? null;
        cursorUserId = id ?? null;
      } catch (err) {
        cursorUpdatedAt = null;
        cursorUserId = null;
      }
    }

    const cursorClause = cursorUpdatedAt && cursorUserId ? 'AND (p.updated_at, p.user_id) < ($2, $3)' : '';
    const params = cursorUpdatedAt && cursorUserId ? [userId, cursorUpdatedAt, cursorUserId, pageSize] : [userId, pageSize];
    const limitPlaceholder = cursorUpdatedAt && cursorUserId ? '$4' : '$2';
    const res = await app.db.pool.query(
      `SELECT p.user_id AS id,
              p.name,
              p.birth_date,
              EXTRACT(YEAR FROM age(now(), p.birth_date))::int AS age,
              p.bio,
              0::int AS distance,
              0::numeric AS ranking_score,
              p.height_cm,
              p.available_today,
              p.updated_at,
              t.label AS current_tag,
              cl.label AS classification,
              bs.label AS bill_split,
              r.label AS relationship,
              e.label AS education,
              f.label AS family,
              d.label AS drink,
              sm.label AS smoke,
              pe.label AS pets,
              ex.label AS exercise,
              fo.label AS food,
              sl.label AS sleep,
              ARRAY(SELECT tag.label FROM profile_tags pt JOIN tags tag ON tag.id = pt.tag_id WHERE pt.user_id = p.user_id ORDER BY tag.sort_order, tag.id) AS tags,
              ARRAY(SELECT l.label FROM profile_looking_for pl JOIN looking_for_options l ON l.id = pl.looking_for_id WHERE pl.user_id = p.user_id ORDER BY l.sort_order, l.id) AS looking_for,
              ARRAY(SELECT per.label FROM profile_personality pp JOIN personality_traits per ON per.id = pp.personality_id WHERE pp.user_id = p.user_id ORDER BY per.sort_order, per.id) AS personality,
              ARRAY(SELECT COALESCE(public_url, gcs_path) FROM profile_photos ph WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL ORDER BY ph.order_index, ph.created_at) AS images
       FROM profiles p
       LEFT JOIN tags t ON t.id = p.current_tag_id
       LEFT JOIN classifications cl ON cl.id = p.classification_id
       LEFT JOIN bill_split_options bs ON bs.id = p.bill_split_id
       LEFT JOIN relationships r ON r.id = p.relationship_id
       LEFT JOIN educations e ON e.id = p.education_id
       LEFT JOIN families f ON f.id = p.family_id
       LEFT JOIN drinks d ON d.id = p.drink_id
       LEFT JOIN smokes sm ON sm.id = p.smoke_id
       LEFT JOIN pets pe ON pe.id = p.pets_id
       LEFT JOIN exercises ex ON ex.id = p.exercise_id
       LEFT JOIN foods fo ON fo.id = p.food_id
       LEFT JOIN sleeps sl ON sl.id = p.sleep_id
       WHERE p.user_id <> $1
         AND EXISTS (
           SELECT 1 FROM profile_photos ph
           WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL
         )
         AND NOT EXISTS (
           SELECT 1 FROM swipes s
           WHERE s.from_user_id = $1 AND s.to_user_id = p.user_id
         )
         ${cursorClause}
       ORDER BY p.updated_at DESC, p.user_id DESC
       LIMIT ${limitPlaceholder}`,
      params
    );

    const profiles = res.rows.map(toPublicProfile);
    const lastRow = res.rows[res.rows.length - 1] as { updated_at?: string; id?: string } | undefined;
    const nextCursor = lastRow?.updated_at && lastRow?.id
      ? Buffer.from(`${lastRow.updated_at}|${lastRow.id}`).toString('base64url')
      : null;

    return { profiles, nextCursor };
  });

  app.post('/v1/swipes', { preHandler: app.requireAuth }, async (req, reply) => {
    const body = req.body as { targetUserId?: string; direction?: string };
    const userId = req.user!.userId;
    if (!body.targetUserId || !body.direction) return reply.code(400).send({ error: 'invalid_payload' });

    await app.db.pool.query(
      `INSERT INTO swipes (from_user_id, to_user_id, direction)
       VALUES ($1, $2, $3)
       ON CONFLICT (from_user_id, to_user_id) DO UPDATE SET direction = EXCLUDED.direction, created_at = now()`,
      [userId, body.targetUserId, body.direction]
    );

    if (body.direction === 'like' || body.direction === 'superlike') {
      const res = await app.db.pool.query(
        `SELECT 1 FROM swipes WHERE from_user_id = $1 AND to_user_id = $2 AND direction IN ('like', 'superlike') LIMIT 1`,
        [body.targetUserId, userId]
      );
      if ((res.rowCount ?? 0) > 0) {
        const [a, b] = userId < body.targetUserId ? [userId, body.targetUserId] : [body.targetUserId, userId];
        await app.db.pool.query(
          `INSERT INTO matches (user_a, user_b)
           VALUES ($1, $2)
           ON CONFLICT (user_a, user_b) DO NOTHING`,
          [a, b]
        );
      }
    }

    return reply.send({ ok: true });
  });

  app.get('/v1/likes', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    const res = await app.db.pool.query(
      `SELECT p.user_id AS id,
              p.name,
              ARRAY(SELECT COALESCE(public_url, gcs_path) FROM profile_photos ph WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL ORDER BY ph.order_index, ph.created_at) AS images
       FROM swipes s
       JOIN profiles p ON p.user_id = s.from_user_id
       WHERE s.to_user_id = $1
         AND s.direction IN ('like', 'superlike')
       ORDER BY s.created_at DESC`,
      [userId]
    );

    return {
      likes: res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        image: row.images?.[0] || null
      }))
    };
  });
}
