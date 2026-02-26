import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { ALLOWED_IMAGE_CONTENT_TYPES, createGcsClient, createSignedUploadUrl } from '../storage/gcs.js';

const uploadUrlSchema = z.object({
  contentType: z.string().min(1),
  fileName: z.string().optional()
});

const completeSchema = z.object({
  gcsPath: z.string().min(1),
  publicUrl: z.string().url().optional(),
  orderIndex: z.number().int().min(0).max(5),
  isPrimary: z.boolean().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional()
});

const cleanupSchema = z.object({
  keepGcsPaths: z.array(z.string().min(1)).optional()
});

const reorderSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(1).max(6)
});

function getExtension(fileName?: string, contentType?: string) {
  const byName = fileName?.split('.').pop()?.toLowerCase();
  if (byName && ['jpg', 'jpeg', 'png', 'webp'].includes(byName)) return byName;
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

export async function registerPhotosRoutes(app: FastifyInstance, config: AppConfig) {
  const gcs = createGcsClient(config);

  app.post('/v1/profile/photos/upload-url', { preHandler: app.requireAuth }, async (req, reply) => {
    if (!gcs) return reply.code(503).send({ error: 'storage_not_configured' });

    const body = uploadUrlSchema.parse(req.body);
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(body.contentType)) {
      return reply.code(400).send({ error: 'invalid_content_type' });
    }

    const userId = req.user!.userId;
    const ext = getExtension(body.fileName, body.contentType);
    const objectPath = `profiles/${userId}/${Date.now()}-${randomUUID()}.${ext}`;

    try {
      const signed = await createSignedUploadUrl(gcs, {
        objectPath,
        contentType: body.contentType
      });

      return reply.send(signed);
    } catch (error) {
      req.log.error({ err: error }, 'failed_to_create_signed_upload_url');
      return reply.code(503).send({ error: 'storage_unavailable' });
    }
  });

  app.post('/v1/profile/photos/complete', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const body = completeSchema.parse(req.body);

    if (body.isPrimary) {
      await app.db.pool.query('UPDATE profile_photos SET is_primary = false WHERE user_id = $1', [userId]);
    }

    const res = await app.db.pool.query(
      `INSERT INTO profile_photos (user_id, gcs_path, public_url, width, height, order_index, is_primary, deleted_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL)
       ON CONFLICT (user_id, order_index) DO UPDATE SET
         gcs_path = EXCLUDED.gcs_path,
         public_url = EXCLUDED.public_url,
         width = EXCLUDED.width,
         height = EXCLUDED.height,
         is_primary = EXCLUDED.is_primary,
         deleted_at = NULL
       RETURNING id, gcs_path, public_url, order_index, is_primary`,
      [userId, body.gcsPath, body.publicUrl ?? null, body.width ?? null, body.height ?? null, body.orderIndex, body.isPrimary ?? body.orderIndex === 0]
    );

    return reply.send({ photo: res.rows[0] });
  });

  app.put('/v1/profile/photos/reorder', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const body = reorderSchema.parse(req.body);

    const existing = await app.db.pool.query(
      `SELECT id FROM profile_photos
       WHERE user_id = $1 AND deleted_at IS NULL AND id = ANY($2)`,
      [userId, body.photoIds]
    );

    if ((existing.rowCount ?? 0) !== body.photoIds.length) {
      return reply.code(400).send({ error: 'invalid_photo_ids' });
    }

    await app.db.pool.query('BEGIN');
    try {
      await app.db.pool.query(
        `UPDATE profile_photos
         SET order_index = -order_index - 1
         WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId]
      );

      for (let index = 0; index < body.photoIds.length; index += 1) {
        const photoId = body.photoIds[index];
        await app.db.pool.query(
          `UPDATE profile_photos
           SET order_index = $3,
               is_primary = $4
           WHERE id = $1 AND user_id = $2`,
          [photoId, userId, index, index === 0]
        );
      }

      await app.db.pool.query('COMMIT');
    } catch (error) {
      await app.db.pool.query('ROLLBACK');
      throw error;
    }

    return reply.send({ ok: true });
  });

  app.delete('/v1/profile/photos/:photoId', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const photoId = (req.params as { photoId: string }).photoId;

    const res = await app.db.pool.query(
      `UPDATE profile_photos
       SET deleted_at = now(), is_primary = false
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [photoId, userId]
    );

    if ((res.rowCount ?? 0) === 0) return reply.code(404).send({ error: 'photo_not_found' });

    const nextPrimary = await app.db.pool.query(
      `SELECT id
       FROM profile_photos
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY order_index, created_at
       LIMIT 1`,
      [userId]
    );

    if ((nextPrimary.rowCount ?? 0) > 0) {
      await app.db.pool.query('UPDATE profile_photos SET is_primary = true WHERE id = $1', [nextPrimary.rows[0].id]);
    }

    return reply.send({ ok: true });
  });

  app.post('/v1/profile/photos/cleanup', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const body = cleanupSchema.parse(req.body);
    const keepGcsPaths = body.keepGcsPaths ?? [];

    if (keepGcsPaths.length === 0) {
      await app.db.pool.query('UPDATE profile_photos SET deleted_at = now(), is_primary = false WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
      return reply.send({ ok: true, deleted: 'all' });
    }

    await app.db.pool.query(
      `UPDATE profile_photos
       SET deleted_at = now(), is_primary = false
       WHERE user_id = $1 AND deleted_at IS NULL AND gcs_path <> ALL($2)`,
      [userId, keepGcsPaths]
    );

    return reply.send({ ok: true });
  });
}
