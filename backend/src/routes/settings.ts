import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';

const updateSettingsSchema = z.object({
  minAge: z.number().int().min(18).max(100),
  maxAge: z.number().int().min(18).max(100),
  maxDistanceKm: z.number().int().min(1).max(500),
  expandDistance: z.boolean(),
  expandAge: z.boolean(),
  internationalMode: z.boolean(),
  discoveryState: z.string().trim().min(2).max(2).nullable(),
  discoveryCity: z.string().trim().min(1).max(120).nullable(),
  profileVisible: z.boolean(),
  hideAge: z.boolean(),
  readReceiptsEnabled: z.boolean(),
  allowMarketingEmails: z.boolean()
});

type SettingsRow = {
  min_age: number;
  max_age: number;
  max_distance_km: number;
  expand_distance: boolean;
  expand_age: boolean;
  international_mode: boolean;
  discovery_state_code: string | null;
  discovery_city_name: string | null;
  profile_visible: boolean;
  hide_age: boolean;
  read_receipts_enabled: boolean;
  allow_marketing_emails: boolean;
};

async function findStateId(app: FastifyInstance, code: string | null) {
  if (!code) return null;
  const res = await app.db.pool.query('SELECT id FROM states WHERE code = $1 LIMIT 1', [code]);
  return (res.rows[0] as { id: number } | undefined)?.id ?? null;
}

async function findCityId(app: FastifyInstance, stateId: number | null, name: string | null) {
  if (!stateId || !name) return null;
  const res = await app.db.pool.query('SELECT id FROM cities WHERE state_id = $1 AND name = $2 LIMIT 1', [stateId, name]);
  return (res.rows[0] as { id: number } | undefined)?.id ?? null;
}

async function getSettings(app: FastifyInstance, userId: string) {
  const res = await app.db.pool.query(
    `SELECT pp.min_age,
            pp.max_age,
            pp.max_distance_km,
            pp.expand_distance,
            pp.expand_age,
            pp.international_mode,
            ds.code AS discovery_state_code,
            dc.name AS discovery_city_name,
            pp.profile_visible,
            pp.hide_age,
            pp.read_receipts_enabled,
            pp.allow_marketing_emails
     FROM profile_preferences pp
     LEFT JOIN states ds ON ds.id = pp.discovery_state_id
     LEFT JOIN cities dc ON dc.id = pp.discovery_city_id
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );

  const row = res.rows[0] as SettingsRow | undefined;

  return {
    minAge: row?.min_age ?? 18,
    maxAge: row?.max_age ?? 94,
    maxDistanceKm: row?.max_distance_km ?? 35,
    expandDistance: row?.expand_distance ?? true,
    expandAge: row?.expand_age ?? false,
    internationalMode: row?.international_mode ?? false,
    discoveryState: row?.discovery_state_code ?? null,
    discoveryCity: row?.discovery_city_name ?? null,
    profileVisible: row?.profile_visible ?? true,
    hideAge: row?.hide_age ?? false,
    readReceiptsEnabled: row?.read_receipts_enabled ?? true,
    allowMarketingEmails: row?.allow_marketing_emails ?? false
  };
}

export async function registerSettingsRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/settings', { preHandler: app.requireAuth }, async (req) => {
    const userId = req.user!.userId;
    return { settings: await getSettings(app, userId) };
  });

  app.put('/v1/settings', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const body = updateSettingsSchema.parse(req.body);

    if (body.minAge > body.maxAge) {
      return reply.code(400).send({ error: 'invalid_age_range' });
    }

    if ((body.discoveryState && !body.discoveryCity) || (!body.discoveryState && body.discoveryCity)) {
      return reply.code(400).send({ error: 'invalid_discovery_location' });
    }

    const discoveryStateId = await findStateId(app, body.discoveryState ?? null);
    if (body.discoveryState && !discoveryStateId) {
      return reply.code(400).send({ error: 'invalid_discovery_location' });
    }

    const discoveryCityId = await findCityId(app, discoveryStateId, body.discoveryCity ?? null);
    if (body.discoveryCity && !discoveryCityId) {
      return reply.code(400).send({ error: 'invalid_discovery_location' });
    }

    await app.db.pool.query(
      `INSERT INTO profile_preferences (
        user_id, min_age, max_age, max_distance_km, expand_distance, expand_age, international_mode,
        discovery_state_id, discovery_city_id, profile_visible, hide_age, read_receipts_enabled, allow_marketing_emails, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
      ON CONFLICT (user_id) DO UPDATE SET
        min_age = EXCLUDED.min_age,
        max_age = EXCLUDED.max_age,
        max_distance_km = EXCLUDED.max_distance_km,
        expand_distance = EXCLUDED.expand_distance,
        expand_age = EXCLUDED.expand_age,
        international_mode = EXCLUDED.international_mode,
        discovery_state_id = EXCLUDED.discovery_state_id,
        discovery_city_id = EXCLUDED.discovery_city_id,
        profile_visible = EXCLUDED.profile_visible,
        hide_age = EXCLUDED.hide_age,
        read_receipts_enabled = EXCLUDED.read_receipts_enabled,
        allow_marketing_emails = EXCLUDED.allow_marketing_emails,
        updated_at = now()`,
      [
        userId,
        body.minAge,
        body.maxAge,
        body.maxDistanceKm,
        body.expandDistance,
        body.expandAge,
        body.internationalMode,
        discoveryStateId,
        discoveryCityId,
        body.profileVisible,
        body.hideAge,
        body.readReceiptsEnabled,
        body.allowMarketingEmails
      ]
    );

    return reply.send({ settings: await getSettings(app, userId) });
  });
}