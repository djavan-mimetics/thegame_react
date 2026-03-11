exports.up = (pgm) => {
  const escape = (value) => String(value).replace(/'/g, "''");

  const users = [
    {
      email: 'seed.rafael@thegame.local',
      profile: {
        name: 'Rafael',
        birthDate: '1994-03-12',
        gender: 'Homem Hétero',
        bio: 'Engenheiro de software, trilhas no fim de semana e café sem açúcar.',
        rankingEnabled: true,
        availableToday: false,
        currentTag: 'Tomar um café',
        classification: 'Dublê de Rico',
        billSplit: 'Racho a conta',
        relationship: 'Namoro',
        education: 'Superior completo',
        family: 'Talvez um dia',
        sign: 'Peixes',
        pets: 'Cachorro',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        exercise: 'Frequentemente',
        food: 'Onívoro',
        sleep: 'Madrugador',
        tags: ['Tomar um café', 'Jogar videogame'],
        lookingFor: ['Mulher Hétero', 'Mulher Bi'],
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
      }
    },
    {
      email: 'seed.bruna@thegame.local',
      profile: {
        name: 'Bruna',
        birthDate: '1998-10-22',
        gender: 'Mulher Hétero',
        bio: 'Arquiteta, apaixonada por praia e por descobrir restaurantes novos.',
        rankingEnabled: true,
        availableToday: true,
        currentTag: 'Praia e água de côco',
        classification: 'Rica',
        billSplit: 'Sou uma princesa, meu date paga a conta',
        relationship: 'Namoro',
        education: 'Pós-graduação',
        family: 'Quero filhos',
        sign: 'Libra',
        pets: 'Gato',
        drink: 'Aos fins de semana',
        smoke: 'Não fumo',
        exercise: 'Às vezes',
        food: 'Onívoro',
        sleep: 'Coruja noturna',
        tags: ['Praia e água de côco', 'Vinho à dois'],
        lookingFor: ['Homem Hétero'],
        photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80'
      }
    },
    {
      email: 'seed.lucas@thegame.local',
      profile: {
        name: 'Lucas',
        birthDate: '1992-06-08',
        gender: 'Homem Bi',
        bio: 'Médico, crossfit de manhã e boardgames à noite.',
        rankingEnabled: true,
        availableToday: false,
        currentTag: 'Jogar videogame',
        classification: 'Pobre Premium',
        billSplit: 'Pago a conta',
        relationship: 'Peguete',
        education: 'Mestrado',
        family: 'Não quero filhos',
        sign: 'Gêmeos',
        pets: 'Não tenho',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        exercise: 'Todo dia',
        food: 'Onívoro',
        sleep: 'Madrugadora',
        tags: ['Jogar videogame', 'Rock e Alterna'],
        lookingFor: ['Mulher Hétero', 'Homem Gay'],
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      }
    },
    {
      email: 'seed.camila@thegame.local',
      profile: {
        name: 'Camila',
        birthDate: '2000-01-17',
        gender: 'Mulher Bi',
        bio: 'Fotógrafa freelancer. Amo shows, vinil e bons papos.',
        rankingEnabled: true,
        availableToday: true,
        currentTag: 'Rock e Alterna',
        classification: 'Dublê de rica',
        billSplit: 'Racho a conta',
        relationship: 'Amizade colorida',
        education: 'Cursando Graduação',
        family: 'Talvez um dia',
        sign: 'Capricórnio',
        pets: 'Amo todos',
        drink: 'Frequentemente',
        smoke: 'Fumo socialmente',
        exercise: 'Às vezes',
        food: 'Vegetariana',
        sleep: 'Coruja noturna',
        tags: ['Rock e Alterna', 'Tomar uma breja'],
        lookingFor: ['Homem Hétero', 'Mulher Hétero'],
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
      }
    },
    {
      email: 'seed.gabriel@thegame.local',
      profile: {
        name: 'Gabriel',
        birthDate: '1989-12-03',
        gender: 'Homem Hétero',
        bio: 'Empreendedor, fã de corrida de rua e viagens internacionais.',
        rankingEnabled: true,
        availableToday: false,
        currentTag: 'Viajar o mundo',
        classification: 'Velho da Lancha',
        billSplit: 'Pago a conta',
        relationship: 'Casamento',
        education: 'Doutorado',
        family: 'Quero filhos',
        sign: 'Sagitário',
        pets: 'Cachorro',
        drink: 'Aos fins de semana',
        smoke: 'Não fumo',
        exercise: 'Frequentemente',
        food: 'Onívoro',
        sleep: 'Madrugador',
        tags: ['Viajar o mundo', 'Tomar um café'],
        lookingFor: ['Mulher Hétero'],
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80'
      }
    },
    {
      email: 'seed.isabela@thegame.local',
      profile: {
        name: 'Isabela',
        birthDate: '1996-04-28',
        gender: 'Mulher Hétero',
        bio: 'Advogada, ama samba, pets e cozinhar em casa.',
        rankingEnabled: true,
        availableToday: true,
        currentTag: 'Sambinha e pagode',
        classification: 'Pobre Premium',
        billSplit: 'Racho a conta',
        relationship: 'Namoro',
        education: 'Superior completo',
        family: 'Tenho filhos',
        sign: 'Touro',
        pets: 'Gato',
        drink: 'Socialmente',
        smoke: 'Não fumo',
        exercise: 'Às vezes',
        food: 'Onívoro',
        sleep: 'Dorme cedo',
        tags: ['Sambinha e pagode', 'Tomar um café'],
        lookingFor: ['Homem Hétero'],
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
      }
    }
  ];

  users.forEach(({ email, profile }) => {
    pgm.sql(
      `INSERT INTO users (email, status)
       VALUES ('${escape(email)}', 'active')
       ON CONFLICT (email) DO NOTHING`
    );

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

    pgm.sql(
      `INSERT INTO profile_photos (user_id, gcs_path, public_url, order_index, is_primary, created_at)
       SELECT u.id, '${escape(profile.photo)}', '${escape(profile.photo)}', 0, true, now()
       FROM users u
       WHERE u.email = '${escape(email)}'
       ON CONFLICT (user_id, order_index) DO UPDATE
       SET gcs_path = EXCLUDED.gcs_path,
           public_url = EXCLUDED.public_url,
           is_primary = EXCLUDED.is_primary,
           deleted_at = NULL`
    );

    profile.tags.forEach((tag) => {
      pgm.sql(
        `INSERT INTO profile_tags (user_id, tag_id)
         SELECT u.id, t.id
         FROM users u, tags t
         WHERE u.email = '${escape(email)}' AND t.label = '${escape(tag)}'
         ON CONFLICT DO NOTHING`
      );
    });

    profile.lookingFor.forEach((lf) => {
      pgm.sql(
        `INSERT INTO profile_looking_for (user_id, looking_for_id)
         SELECT u.id, l.id
         FROM users u, looking_for_options l
         WHERE u.email = '${escape(email)}' AND l.label = '${escape(lf)}'
         ON CONFLICT DO NOTHING`
      );
    });
  });
};

exports.down = (pgm) => {
  pgm.sql("DELETE FROM profile_tags WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'seed.%@thegame.local')");
  pgm.sql("DELETE FROM profile_looking_for WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'seed.%@thegame.local')");
  pgm.sql("DELETE FROM profile_photos WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'seed.%@thegame.local')");
  pgm.sql("DELETE FROM profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'seed.%@thegame.local')");
  pgm.sql("DELETE FROM users WHERE email LIKE 'seed.%@thegame.local'");
};
