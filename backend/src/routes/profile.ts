import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from '../config.js';
import { getProfile, upsertProfile } from '../profile/repo.js';

export async function registerProfileRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/profile', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const profile = await getProfile(app.db, userId);
    if (!profile) return reply.send({ profile: null });
    return reply.send({ profile });
  });

  const updateSchema = z.object({
    name: z.string().min(1).optional(),
    birthDate: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    gender: z.string().nullable().optional(),
    height: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    rankingEnabled: z.boolean().optional(),
    availableToday: z.boolean().optional(),
    currentTag: z.string().nullable().optional(),
    classification: z.string().nullable().optional(),
    billSplit: z.string().nullable().optional(),
    relationship: z.string().nullable().optional(),
    education: z.string().nullable().optional(),
    family: z.string().nullable().optional(),
    sign: z.string().nullable().optional(),
    pets: z.string().nullable().optional(),
    drink: z.string().nullable().optional(),
    smoke: z.string().nullable().optional(),
    exercise: z.string().nullable().optional(),
    food: z.string().nullable().optional(),
    sleep: z.string().nullable().optional(),
    tags: z.array(z.string().min(1)).max(3).optional(),
    lookingFor: z.array(z.string().min(1)).optional(),
    personality: z.array(z.string().min(1)).optional(),
    images: z.array(z.string().min(1)).max(6).optional()
  });

  const lookupTableMap: Record<string, string> = {
    gender: 'genders',
    currentTag: 'tags',
    classification: 'classifications',
    billSplit: 'bill_split_options',
    relationship: 'relationships',
    education: 'educations',
    family: 'families',
    sign: 'signs',
    pets: 'pets',
    drink: 'drinks',
    smoke: 'smokes',
    exercise: 'exercises',
    food: 'foods',
    sleep: 'sleeps'
  };

  const invalidOption = (field: string, values: string[]) => ({ field, values });

  const ensureLookup = async (field: string, value: string | null | undefined) => {
    if (!value) return null;
    const table = lookupTableMap[field];
    const res = await app.db.pool.query(`SELECT 1 FROM ${table} WHERE label = $1 LIMIT 1`, [value]);
    return (res.rowCount ?? 0) > 0 ? null : invalidOption(field, [value]);
  };

  const ensureLookupList = async (field: string, table: string, values?: string[]) => {
    if (!values) return null;
    const uniqueValues = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
    if (uniqueValues.length === 0) return null;
    const res = await app.db.pool.query(`SELECT label FROM ${table} WHERE label = ANY($1)`, [uniqueValues]);
    const found = new Set(res.rows.map((row) => row.label as string));
    const missing = uniqueValues.filter((value) => !found.has(value));
    return missing.length ? invalidOption(field, missing) : null;
  };

  const validateProfileInput = async (body: z.infer<typeof updateSchema>) => {
    if (body.city && !body.state) return invalidOption('state', ['required_with_city']);

    if (body.state) {
      const stateRes = await app.db.pool.query('SELECT id FROM states WHERE code = $1 LIMIT 1', [body.state]);
      if ((stateRes.rowCount ?? 0) === 0) return invalidOption('state', [body.state]);
      if (body.city) {
        const cityRes = await app.db.pool.query(
          'SELECT 1 FROM cities WHERE state_id = $1 AND name = $2 LIMIT 1',
          [stateRes.rows[0].id, body.city]
        );
        if ((cityRes.rowCount ?? 0) === 0) return invalidOption('city', [body.city]);
      }
    }

    const lookupFields = Object.keys(lookupTableMap) as (keyof typeof lookupTableMap)[];
    for (const field of lookupFields) {
      const value = body[field as keyof typeof body] as string | null | undefined;
      const invalid = await ensureLookup(field, value);
      if (invalid) return invalid;
    }

    return (
      (await ensureLookupList('tags', 'tags', body.tags)) ||
      (await ensureLookupList('lookingFor', 'looking_for_options', body.lookingFor)) ||
      (await ensureLookupList('personality', 'personality_traits', body.personality)) ||
      null
    );
  };

  app.put('/v1/profile', { preHandler: app.requireAuth }, async (req, reply) => {
    const userId = req.user!.userId;
    const body = updateSchema.parse(req.body);

    const invalid = await validateProfileInput(body);
    if (invalid) return reply.code(400).send({ error: 'invalid_option', ...invalid });

    const heightCm = body.height ? parseInt(body.height.replace(/\D/g, ''), 10) || null : undefined;

    await upsertProfile(app.db, {
      userId,
      name: body.name,
      birthDate: body.birthDate ?? undefined,
      state: body.state ?? undefined,
      city: body.city ?? undefined,
      gender: body.gender ?? undefined,
      heightCm: heightCm ?? undefined,
      bio: body.bio ?? undefined,
      rankingEnabled: body.rankingEnabled,
      availableToday: body.availableToday,
      currentTag: body.currentTag ?? undefined,
      classification: body.classification ?? undefined,
      billSplit: body.billSplit ?? undefined,
      relationship: body.relationship ?? undefined,
      education: body.education ?? undefined,
      family: body.family ?? undefined,
      sign: body.sign ?? undefined,
      pets: body.pets ?? undefined,
      drink: body.drink ?? undefined,
      smoke: body.smoke ?? undefined,
      exercise: body.exercise ?? undefined,
      food: body.food ?? undefined,
      sleep: body.sleep ?? undefined,
      tags: body.tags,
      lookingFor: body.lookingFor,
      personality: body.personality,
      photos: body.images
    });

    const profile = await getProfile(app.db, userId);
    return reply.send({ profile });
  });
}
