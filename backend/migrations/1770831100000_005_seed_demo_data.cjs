exports.up = (pgm) => {
  const escape = (value) => String(value).replace(/'/g, "''");
  const insertUser = (email) => {
    pgm.sql(
      `INSERT INTO users (email, status)
       VALUES ('${escape(email)}', 'active')
       ON CONFLICT (email) DO NOTHING`
    );
  };

  const demoUsers = [
    'demo1@thegame.local',
    'demo2@thegame.local',
    'demo3@thegame.local'
  ];

  demoUsers.forEach(insertUser);

  const insertProfile = (email, profile) => {
    pgm.sql(
      `INSERT INTO profiles (
        user_id, name, birth_date, gender_id, bio, ranking_enabled, available_today,
        current_tag_id, classification_id, bill_split_id, relationship_id, education_id,
        family_id, sign_id, pets_id, drink_id, smoke_id, exercise_id, food_id, sleep_id,
        created_at, updated_at
      )
      SELECT u.id,
        '${escape(profile.name)}',
        '${escape(profile.birthDate)}',
        (SELECT id FROM genders WHERE label = '${escape(profile.gender)}' LIMIT 1),
        '${escape(profile.bio)}',
        ${profile.rankingEnabled ? 'true' : 'false'},
        ${profile.availableToday ? 'true' : 'false'},
        (SELECT id FROM tags WHERE label = '${escape(profile.currentTag)}' LIMIT 1),
        (SELECT id FROM classifications WHERE label = '${escape(profile.classification)}' LIMIT 1),
        (SELECT id FROM bill_split_options WHERE label = '${escape(profile.billSplit)}' LIMIT 1),
        (SELECT id FROM relationships WHERE label = '${escape(profile.relationship)}' LIMIT 1),
        (SELECT id FROM educations WHERE label = '${escape(profile.education)}' LIMIT 1),
        (SELECT id FROM families WHERE label = '${escape(profile.family)}' LIMIT 1),
        (SELECT id FROM signs WHERE label = '${escape(profile.sign)}' LIMIT 1),
        (SELECT id FROM pets WHERE label = '${escape(profile.pets)}' LIMIT 1),
        (SELECT id FROM drinks WHERE label = '${escape(profile.drink)}' LIMIT 1),
        (SELECT id FROM smokes WHERE label = '${escape(profile.smoke)}' LIMIT 1),
        (SELECT id FROM exercises WHERE label = '${escape(profile.exercise)}' LIMIT 1),
        (SELECT id FROM foods WHERE label = '${escape(profile.food)}' LIMIT 1),
        (SELECT id FROM sleeps WHERE label = '${escape(profile.sleep)}' LIMIT 1),
        now(), now()
      FROM users u
      WHERE u.email = '${escape(email)}'
      ON CONFLICT (user_id) DO NOTHING`
    );
  };

  insertProfile('demo1@thegame.local', {
    name: 'Jessica',
    birthDate: '1999-06-01',
    gender: 'Mulher Hétero',
    bio: 'Designer de dia, gamer à noite. Procurando alguém para me carregar nas rankeadas.',
    rankingEnabled: true,
    availableToday: true,
    currentTag: 'Jogar videogame',
    classification: 'Pobre Premium',
    billSplit: 'Racho a conta',
    relationship: 'Namoro',
    education: 'Superior completo',
    family: 'Talvez um dia',
    sign: 'Áries',
    pets: 'Gato',
    drink: 'Socialmente',
    smoke: 'Não fumo',
    exercise: 'Às vezes',
    food: 'Onívoro',
    sleep: 'Coruja noturna'
  });

  insertProfile('demo2@thegame.local', {
    name: 'Amanda',
    birthDate: '1997-02-10',
    gender: 'Mulher Bi',
    bio: 'Viciada em café e entusiasta de viagens. Vamos planejar nossa próxima trip!',
    rankingEnabled: true,
    availableToday: false,
    currentTag: 'Tomar um café',
    classification: 'Rica',
    billSplit: 'Sou uma princesa, meu date paga a conta',
    relationship: 'Namoro',
    education: 'Pós-graduação',
    family: 'Não quero filhos',
    sign: 'Libra',
    pets: 'Amo todos',
    drink: 'Frequentemente',
    smoke: 'Fumo socialmente',
    exercise: 'Às vezes',
    food: 'Vegetariana',
    sleep: 'Madrugadora'
  });

  insertProfile('demo3@thegame.local', {
    name: 'Camila',
    birthDate: '2002-01-15',
    gender: 'Mulher Hétero',
    bio: 'Só pelas vibes. Rio de Janeiro ☀️',
    rankingEnabled: false,
    availableToday: true,
    currentTag: 'Sambinha e pagode',
    classification: 'Dublê de rica',
    billSplit: 'Pago a conta',
    relationship: 'Amizade colorida',
    education: 'Cursando Graduação',
    family: 'Talvez um dia',
    sign: 'Leão',
    pets: 'Amo todos',
    drink: 'Aos fins de semana',
    smoke: 'Fumo quando bebo',
    exercise: 'Todo dia',
    food: 'Carnívoro',
    sleep: 'Coruja noturna'
  });

  const insertPhotos = (email, photos) => {
    photos.forEach((url, index) => {
      pgm.sql(
        `INSERT INTO profile_photos (user_id, gcs_path, public_url, order_index, is_primary, created_at)
         SELECT u.id, '${escape(url)}', '${escape(url)}', ${index}, ${index === 0 ? 'true' : 'false'}, now()
         FROM users u
         WHERE u.email = '${escape(email)}'`
      );
    });
  };

  insertPhotos('demo1@thegame.local', [
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
  ]);

  insertPhotos('demo2@thegame.local', [
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  ]);

  insertPhotos('demo3@thegame.local', [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80'
  ]);

  const insertTags = (email, tags) => {
    tags.forEach((tag) => {
      pgm.sql(
        `INSERT INTO profile_tags (user_id, tag_id)
         SELECT u.id, t.id
         FROM users u, tags t
         WHERE u.email = '${escape(email)}' AND t.label = '${escape(tag)}'
         ON CONFLICT DO NOTHING`
      );
    });
  };

  insertTags('demo1@thegame.local', ['Jogar videogame', 'Rock e Alterna']);
  insertTags('demo2@thegame.local', ['Tomar um café', 'Praia e água de côco']);
  insertTags('demo3@thegame.local', ['Boate', 'Sambinha e pagode']);

  const insertLookingFor = (email, options) => {
    options.forEach((opt) => {
      pgm.sql(
        `INSERT INTO profile_looking_for (user_id, looking_for_id)
         SELECT u.id, l.id
         FROM users u, looking_for_options l
         WHERE u.email = '${escape(email)}' AND l.label = '${escape(opt)}'
         ON CONFLICT DO NOTHING`
      );
    });
  };

  insertLookingFor('demo1@thegame.local', ['Homem Hétero', 'Homem Bi']);
  insertLookingFor('demo2@thegame.local', ['Homem Hétero', 'Mulher Hétero']);
  insertLookingFor('demo3@thegame.local', ['Homem Hétero']);
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM profile_photos WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%@thegame.local')");
  pgm.sql("DELETE FROM profile_tags WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%@thegame.local')");
  pgm.sql("DELETE FROM profile_looking_for WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%@thegame.local')");
  pgm.sql("DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'demo%@thegame.local')");
  pgm.sql("DELETE FROM users WHERE email LIKE 'demo%@thegame.local'");
};
