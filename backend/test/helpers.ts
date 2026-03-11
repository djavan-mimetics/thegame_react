import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

let requestCounter = 0;

export function prepareTestEnv(overrides?: Record<string, string>) {
  process.env.PORT = '0';
  process.env.HOST = '127.0.0.1';
  process.env.CORS_ORIGIN = '*';
  process.env.LOG_LEVEL = 'silent';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-secret';
  process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://thegame:thegame@localhost:5432/thegame';

  for (const [key, value] of Object.entries(overrides ?? {})) {
    process.env[key] = value;
  }
}

function nextRemoteAddress() {
  requestCounter += 1;
  return `127.0.0.${(requestCounter % 200) + 1}`;
}

export function authHeaders(accessToken: string) {
  return {
    authorization: `Bearer ${accessToken}`
  };
}

export async function registerUser(app: FastifyInstance, prefix: string) {
  const email = `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
  const password = 'Password#1234';

  const response = await app.inject({
    method: 'POST',
    url: '/v1/auth/register',
    payload: { email, password },
    remoteAddress: nextRemoteAddress()
  });

  if (response.statusCode !== 201) {
    throw new Error(`register failed: ${response.statusCode} ${response.body}`);
  }

  const json = response.json();

  if (json.verificationToken) {
    const verify = await app.inject({
      method: 'POST',
      url: '/v1/auth/verify-email',
      payload: { token: json.verificationToken },
      remoteAddress: nextRemoteAddress()
    });

    if (verify.statusCode !== 200) {
      throw new Error(`verify failed: ${verify.statusCode} ${verify.body}`);
    }
  }

  return {
    userId: String(json.user.id),
    email,
    password,
    accessToken: String(json.accessToken),
    refreshToken: String(json.refreshToken)
  };
}

export async function cleanupUsers(app: FastifyInstance, userIds: string[]) {
  if (userIds.length === 0) return;
  await app.db.pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);
}

export async function getLookupLabel(app: FastifyInstance, table: string, extraWhere?: string) {
  const res = await app.db.pool.query(
    `SELECT label FROM ${table} ${extraWhere ? `WHERE ${extraWhere}` : ''} ORDER BY sort_order, id LIMIT 1`
  );
  return (res.rows[0] as { label: string } | undefined)?.label ?? null;
}

export async function getStateCity(app: FastifyInstance) {
  const stateRes = await app.db.pool.query('SELECT id, code FROM states ORDER BY id LIMIT 1');
  const state = stateRes.rows[0] as { id: number; code: string } | undefined;
  if (!state) return { state: null, city: null };

  const cityRes = await app.db.pool.query('SELECT name FROM cities WHERE state_id = $1 ORDER BY id LIMIT 1', [state.id]);
  return {
    state: state.code,
    city: (cityRes.rows[0] as { name: string } | undefined)?.name ?? null
  };
}

export async function buildValidProfilePayload(app: FastifyInstance, suffix: string) {
  const [{ state, city }, gender, currentTag, classification, billSplit, relationship, education, family, sign, pets, drink, smoke, exercise, food, sleep, lookingFor, personality] = await Promise.all([
    getStateCity(app),
    getLookupLabel(app, 'genders'),
    getLookupLabel(app, 'tags'),
    getLookupLabel(app, 'classifications'),
    getLookupLabel(app, 'bill_split_options'),
    getLookupLabel(app, 'relationships'),
    getLookupLabel(app, 'educations'),
    getLookupLabel(app, 'families'),
    getLookupLabel(app, 'signs'),
    getLookupLabel(app, 'pets'),
    getLookupLabel(app, 'drinks'),
    getLookupLabel(app, 'smokes'),
    getLookupLabel(app, 'exercises'),
    getLookupLabel(app, 'foods'),
    getLookupLabel(app, 'sleeps'),
    getLookupLabel(app, 'looking_for_options'),
    getLookupLabel(app, 'personality_traits')
  ]);

  const tagsRes = await app.db.pool.query('SELECT label FROM tags ORDER BY sort_order, id LIMIT 2');
  const tags = tagsRes.rows.map((row) => String(row.label));

  return {
    name: `Teste ${suffix}`,
    birthDate: '1995-05-10',
    state,
    city,
    gender,
    height: '180 cm',
    bio: `Bio de teste ${suffix} com mais de vinte caracteres.`,
    rankingEnabled: true,
    availableToday: true,
    currentTag,
    classification,
    billSplit,
    relationship,
    education,
    family,
    sign,
    pets,
    drink,
    smoke,
    exercise,
    food,
    sleep,
    tags,
    lookingFor: lookingFor ? [lookingFor] : [],
    personality: personality ? [personality] : []
  };
}

export async function upsertProfile(app: FastifyInstance, accessToken: string, suffix: string) {
  const payload = await buildValidProfilePayload(app, suffix);
  const response = await app.inject({
    method: 'PUT',
    url: '/v1/profile',
    headers: authHeaders(accessToken),
    payload
  });

  if (response.statusCode !== 200) {
    throw new Error(`profile update failed: ${response.statusCode} ${response.body}`);
  }

  return { payload, response };
}

export async function completePhoto(app: FastifyInstance, accessToken: string, index: number, suffix: string) {
  const response = await app.inject({
    method: 'POST',
    url: '/v1/profile/photos/complete',
    headers: authHeaders(accessToken),
    payload: {
      gcsPath: `profiles/test/${suffix}-${index}.jpg`,
      publicUrl: `https://cdn.example.com/${suffix}-${index}.jpg`,
      orderIndex: index,
      isPrimary: index === 0,
      width: 800,
      height: 1200
    }
  });

  if (response.statusCode !== 200) {
    throw new Error(`photo complete failed: ${response.statusCode} ${response.body}`);
  }

  return response.json().photo as { id: string; gcs_path: string; public_url: string; order_index: number; is_primary: boolean };
}

export async function findMatchId(app: FastifyInstance, userA: string, userB: string) {
  const [a, b] = userA < userB ? [userA, userB] : [userB, userA];
  const res = await app.db.pool.query(
    'SELECT id FROM matches WHERE user_a = $1 AND user_b = $2 LIMIT 1',
    [a, b]
  );
  return (res.rows[0] as { id: string } | undefined)?.id ?? null;
}