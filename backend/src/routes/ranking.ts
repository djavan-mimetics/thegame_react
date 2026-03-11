import type { FastifyInstance } from 'fastify';
import type { AppConfig } from '../config.js';

export async function registerRankingRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/ranking', { preHandler: app.requireAuth }, async (req) => {
    const query = req.query as { state?: string; city?: string; limit?: string };
    const limit = Math.min(Math.max(Number(query.limit ?? 50), 1), 100);

    const params: unknown[] = [];
    let where = 'WHERE p.deleted_at IS NULL AND p.ranking_enabled = true';

    if (query.state) {
      params.push(query.state);
      where += ` AND s.code = $${params.length}`;
    }

    if (query.city) {
      params.push(query.city);
      where += ` AND c.name = $${params.length}`;
    }

    params.push(limit);

    const res = await app.db.pool.query(
      `SELECT p.user_id AS id,
              p.name,
              COALESCE((
                7
                + CASE WHEN p.available_today THEN 1 ELSE 0 END
                + CASE WHEN p.bio IS NOT NULL AND length(trim(p.bio)) > 20 THEN 0.5 ELSE 0 END
                + CASE WHEN EXISTS (SELECT 1 FROM profile_photos ph WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL) THEN 0.5 ELSE 0 END
              ), 7)::numeric(3,1) AS score,
              (
                SELECT COALESCE(public_url, gcs_path)
                FROM profile_photos ph
                WHERE ph.user_id = p.user_id AND ph.deleted_at IS NULL
                ORDER BY ph.order_index, ph.created_at
                LIMIT 1
              ) AS image
       FROM profiles p
       LEFT JOIN states s ON s.id = p.state_id
       LEFT JOIN cities c ON c.id = p.city_id
       ${where}
       ORDER BY score DESC, p.updated_at DESC
       LIMIT $${params.length}`,
      params
    );

    return {
      ranking: res.rows.map((row) => ({
        id: String(row.id ?? ''),
        name: row.name ?? '',
        score: Number(row.score ?? 0),
        image: row.image ?? ''
      }))
    };
  });
}
