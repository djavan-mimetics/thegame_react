import type { FastifyInstance } from 'fastify';
import { createHash } from 'crypto';
import type { AppConfig } from '../config.js';

async function listLabels(app: FastifyInstance, table: string) {
  const res = await app.db.pool.query(
    `SELECT label
     FROM ${table}
     WHERE is_active = true
     ORDER BY sort_order, id`
  );
  return res.rows.map((row) => row.label as string);
}

async function listGender(app: FastifyInstance, table: string) {
  const res = await app.db.pool.query(
    `SELECT label, group
     FROM ${table}
     WHERE is_active = true
     ORDER BY sort_order, id`
  );
  return res.rows.map((row) => ({ label: row.label as string, group: row.group as string }));
}

async function buildLocations(app: FastifyInstance) {
  const statesRes = await app.db.pool.query('SELECT id, code, name FROM states ORDER BY code');
  const citiesRes = await app.db.pool.query('SELECT state_id, name FROM cities ORDER BY name');

  const stateMap = new Map<number, { code: string; name: string; cities: string[] }>();
  for (const st of statesRes.rows) {
    stateMap.set(st.id as number, { code: st.code as string, name: st.name as string, cities: [] });
  }
  for (const city of citiesRes.rows) {
    const entry = stateMap.get(city.state_id as number);
    if (entry) entry.cities.push(city.name as string);
  }

  const locations: Record<string, string[]> = {};
  for (const entry of stateMap.values()) {
    locations[entry.code] = entry.cities;
  }
  return locations;
}

export async function registerOptionsRoutes(app: FastifyInstance, _config: AppConfig) {
  app.get('/v1/options/all', async (req, reply) => {
    const [genders, lookingFor, relationships, classifications, billSplitOptions, tags, educations, families, signs, pets, drinks, smokes, exercises, foods, sleeps, personalityTraits, locations] =
      await Promise.all([
        listGender(app, 'genders'),
        listGender(app, 'looking_for_options'),
        listLabels(app, 'relationships'),
        listLabels(app, 'classifications'),
        listLabels(app, 'bill_split_options'),
        listLabels(app, 'tags'),
        listLabels(app, 'educations'),
        listLabels(app, 'families'),
        listLabels(app, 'signs'),
        listLabels(app, 'pets'),
        listLabels(app, 'drinks'),
        listLabels(app, 'smokes'),
        listLabels(app, 'exercises'),
        listLabels(app, 'foods'),
        listLabels(app, 'sleeps'),
        listLabels(app, 'personality_traits'),
        buildLocations(app)
      ]);

    const payload = {
      genders,
      lookingFor,
      relationships,
      classifications,
      billSplitOptions,
      tags,
      educations,
      families,
      signs,
      pets,
      drinks,
      smokes,
      exercises,
      foods,
      sleeps,
      personalityTraits,
      locations
    };

    const etag = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      return reply.code(304).header('ETag', etag).send();
    }

    return reply.header('ETag', etag).header('Cache-Control', 'public, max-age=300').send(payload);
  });
}
