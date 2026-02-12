import type { Db } from '../db.js';

type ProfileRow = {
  user_id: string;
  name: string;
  birth_date: string | null;
  state_code: string | null;
  city_name: string | null;
  gender_label: string | null;
  height_cm: number | null;
  bio: string | null;
  ranking_enabled: boolean;
  available_today: boolean;
  current_tag: string | null;
  classification: string | null;
  bill_split: string | null;
  relationship: string | null;
  education: string | null;
  family: string | null;
  sign: string | null;
  pets: string | null;
  drink: string | null;
  smoke: string | null;
  exercise: string | null;
  food: string | null;
  sleep: string | null;
};

async function findLookupId(db: Db, table: string, label: string | null) {
  if (!label) return null;
  const res = await db.pool.query(`SELECT id FROM ${table} WHERE label = $1 LIMIT 1`, [label]);
  return (res.rows[0] as { id: number } | undefined)?.id ?? null;
}

async function findStateId(db: Db, code: string | null) {
  if (!code) return null;
  const res = await db.pool.query('SELECT id FROM states WHERE code = $1 LIMIT 1', [code]);
  return (res.rows[0] as { id: number } | undefined)?.id ?? null;
}

async function findCityId(db: Db, stateId: number | null, name: string | null) {
  if (!stateId || !name) return null;
  const res = await db.pool.query('SELECT id FROM cities WHERE state_id = $1 AND name = $2 LIMIT 1', [stateId, name]);
  return (res.rows[0] as { id: number } | undefined)?.id ?? null;
}

export async function getProfile(db: Db, userId: string) {
  const res = await db.pool.query(
    `SELECT p.user_id,
            p.name,
            p.birth_date,
            s.code AS state_code,
            c.name AS city_name,
            g.label AS gender_label,
            p.height_cm,
            p.bio,
            p.ranking_enabled,
            p.available_today,
            t.label AS current_tag,
            cl.label AS classification,
            bs.label AS bill_split,
            r.label AS relationship,
            e.label AS education,
            f.label AS family,
            si.label AS sign,
            pe.label AS pets,
            d.label AS drink,
            sm.label AS smoke,
            ex.label AS exercise,
            fo.label AS food,
            sl.label AS sleep
     FROM profiles p
     LEFT JOIN states s ON s.id = p.state_id
     LEFT JOIN cities c ON c.id = p.city_id
     LEFT JOIN genders g ON g.id = p.gender_id
     LEFT JOIN tags t ON t.id = p.current_tag_id
     LEFT JOIN classifications cl ON cl.id = p.classification_id
     LEFT JOIN bill_split_options bs ON bs.id = p.bill_split_id
     LEFT JOIN relationships r ON r.id = p.relationship_id
     LEFT JOIN educations e ON e.id = p.education_id
     LEFT JOIN families f ON f.id = p.family_id
     LEFT JOIN signs si ON si.id = p.sign_id
     LEFT JOIN pets pe ON pe.id = p.pets_id
     LEFT JOIN drinks d ON d.id = p.drink_id
     LEFT JOIN smokes sm ON sm.id = p.smoke_id
     LEFT JOIN exercises ex ON ex.id = p.exercise_id
     LEFT JOIN foods fo ON fo.id = p.food_id
     LEFT JOIN sleeps sl ON sl.id = p.sleep_id
     WHERE p.user_id = $1
     LIMIT 1`,
    [userId]
  );

  const row = (res.rows[0] as ProfileRow | undefined) ?? null;
  if (!row) return null;

  const tagsRes = await db.pool.query(
    `SELECT t.label
     FROM profile_tags pt
     JOIN tags t ON t.id = pt.tag_id
     WHERE pt.user_id = $1
     ORDER BY t.sort_order, t.id`,
    [userId]
  );

  const lookingForRes = await db.pool.query(
    `SELECT l.label
     FROM profile_looking_for pl
     JOIN looking_for_options l ON l.id = pl.looking_for_id
     WHERE pl.user_id = $1
     ORDER BY l.sort_order, l.id`,
    [userId]
  );

  const personalityRes = await db.pool.query(
    `SELECT p.label
     FROM profile_personality pp
     JOIN personality_traits p ON p.id = pp.personality_id
     WHERE pp.user_id = $1
     ORDER BY p.sort_order, p.id`,
    [userId]
  );

  const photosRes = await db.pool.query(
    `SELECT COALESCE(public_url, gcs_path) AS url
     FROM profile_photos
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY order_index, created_at`,
    [userId]
  );

  return {
    ...row,
    tags: tagsRes.rows.map((r) => r.label as string),
    lookingFor: lookingForRes.rows.map((r) => r.label as string),
    personality: personalityRes.rows.map((r) => r.label as string),
    photos: photosRes.rows.map((r) => r.url as string)
  };
}

export async function upsertProfile(db: Db, input: {
  userId: string;
  name?: string;
  birthDate?: string | null;
  state?: string | null;
  city?: string | null;
  gender?: string | null;
  heightCm?: number | null;
  bio?: string | null;
  rankingEnabled?: boolean;
  availableToday?: boolean;
  currentTag?: string | null;
  classification?: string | null;
  billSplit?: string | null;
  relationship?: string | null;
  education?: string | null;
  family?: string | null;
  sign?: string | null;
  pets?: string | null;
  drink?: string | null;
  smoke?: string | null;
  exercise?: string | null;
  food?: string | null;
  sleep?: string | null;
  tags?: string[];
  lookingFor?: string[];
  personality?: string[];
  photos?: string[];
}) {
  const stateId = await findStateId(db, input.state ?? null);
  const cityId = await findCityId(db, stateId, input.city ?? null);

  const genderId = await findLookupId(db, 'genders', input.gender ?? null);
  const currentTagId = await findLookupId(db, 'tags', input.currentTag ?? null);
  const classificationId = await findLookupId(db, 'classifications', input.classification ?? null);
  const billSplitId = await findLookupId(db, 'bill_split_options', input.billSplit ?? null);
  const relationshipId = await findLookupId(db, 'relationships', input.relationship ?? null);
  const educationId = await findLookupId(db, 'educations', input.education ?? null);
  const familyId = await findLookupId(db, 'families', input.family ?? null);
  const signId = await findLookupId(db, 'signs', input.sign ?? null);
  const petsId = await findLookupId(db, 'pets', input.pets ?? null);
  const drinkId = await findLookupId(db, 'drinks', input.drink ?? null);
  const smokeId = await findLookupId(db, 'smokes', input.smoke ?? null);
  const exerciseId = await findLookupId(db, 'exercises', input.exercise ?? null);
  const foodId = await findLookupId(db, 'foods', input.food ?? null);
  const sleepId = await findLookupId(db, 'sleeps', input.sleep ?? null);

  await db.pool.query(
    `INSERT INTO profiles (
       user_id, name, birth_date, state_id, city_id, gender_id, height_cm, bio,
       ranking_enabled, available_today, current_tag_id, classification_id, bill_split_id,
       relationship_id, education_id, family_id, sign_id, pets_id, drink_id, smoke_id,
       exercise_id, food_id, sleep_id, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13,
       $14, $15, $16, $17, $18, $19, $20,
       $21, $22, $23, now()
     )
     ON CONFLICT (user_id) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, profiles.name),
       birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
       state_id = COALESCE(EXCLUDED.state_id, profiles.state_id),
       city_id = COALESCE(EXCLUDED.city_id, profiles.city_id),
       gender_id = COALESCE(EXCLUDED.gender_id, profiles.gender_id),
       height_cm = COALESCE(EXCLUDED.height_cm, profiles.height_cm),
       bio = COALESCE(EXCLUDED.bio, profiles.bio),
       ranking_enabled = COALESCE(EXCLUDED.ranking_enabled, profiles.ranking_enabled),
       available_today = COALESCE(EXCLUDED.available_today, profiles.available_today),
       current_tag_id = COALESCE(EXCLUDED.current_tag_id, profiles.current_tag_id),
       classification_id = COALESCE(EXCLUDED.classification_id, profiles.classification_id),
       bill_split_id = COALESCE(EXCLUDED.bill_split_id, profiles.bill_split_id),
       relationship_id = COALESCE(EXCLUDED.relationship_id, profiles.relationship_id),
       education_id = COALESCE(EXCLUDED.education_id, profiles.education_id),
       family_id = COALESCE(EXCLUDED.family_id, profiles.family_id),
       sign_id = COALESCE(EXCLUDED.sign_id, profiles.sign_id),
       pets_id = COALESCE(EXCLUDED.pets_id, profiles.pets_id),
       drink_id = COALESCE(EXCLUDED.drink_id, profiles.drink_id),
       smoke_id = COALESCE(EXCLUDED.smoke_id, profiles.smoke_id),
       exercise_id = COALESCE(EXCLUDED.exercise_id, profiles.exercise_id),
       food_id = COALESCE(EXCLUDED.food_id, profiles.food_id),
       sleep_id = COALESCE(EXCLUDED.sleep_id, profiles.sleep_id),
       updated_at = now()`,
    [
      input.userId,
      input.name ?? null,
      input.birthDate ?? null,
      stateId,
      cityId,
      genderId,
      input.heightCm ?? null,
      input.bio ?? null,
      input.rankingEnabled ?? null,
      input.availableToday ?? null,
      currentTagId,
      classificationId,
      billSplitId,
      relationshipId,
      educationId,
      familyId,
      signId,
      petsId,
      drinkId,
      smokeId,
      exerciseId,
      foodId,
      sleepId
    ]
  );

  if (input.tags) {
    await db.pool.query('DELETE FROM profile_tags WHERE user_id = $1', [input.userId]);
    for (const tag of input.tags) {
      const tagId = await findLookupId(db, 'tags', tag);
      if (!tagId) continue;
      await db.pool.query('INSERT INTO profile_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [input.userId, tagId]);
    }
  }

  if (input.lookingFor) {
    await db.pool.query('DELETE FROM profile_looking_for WHERE user_id = $1', [input.userId]);
    for (const lf of input.lookingFor) {
      const lfId = await findLookupId(db, 'looking_for_options', lf);
      if (!lfId) continue;
      await db.pool.query(
        'INSERT INTO profile_looking_for (user_id, looking_for_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [input.userId, lfId]
      );
    }
  }

  if (input.personality) {
    await db.pool.query('DELETE FROM profile_personality WHERE user_id = $1', [input.userId]);
    for (const trait of input.personality) {
      const traitId = await findLookupId(db, 'personality_traits', trait);
      if (!traitId) continue;
      await db.pool.query(
        'INSERT INTO profile_personality (user_id, personality_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [input.userId, traitId]
      );
    }
  }

  if (input.photos) {
    await db.pool.query('UPDATE profile_photos SET deleted_at = now() WHERE user_id = $1', [input.userId]);
    for (let i = 0; i < input.photos.length; i += 1) {
      const url = input.photos[i];
      if (!url) continue;
      await db.pool.query(
        `INSERT INTO profile_photos (user_id, gcs_path, public_url, order_index, is_primary)
         VALUES ($1, $2, $3, $4, $5)`,
        [input.userId, url, url, i, i === 0]
      );
    }
  }
}
