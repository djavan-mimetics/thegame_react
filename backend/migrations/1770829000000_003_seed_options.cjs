exports.up = (pgm) => {
  const escape = (value) => String(value).replace(/'/g, "''");
  const insertList = (table, items) => {
    const values = items
      .map((label, index) => `('${escape(label)}', ${index}, true, now(), now())`)
      .join(', ');
    pgm.sql(`INSERT INTO ${table} (label, sort_order, is_active, created_at, updated_at)
      VALUES ${values}
      ON CONFLICT (label) DO NOTHING`);
  };

  const insertGender = (table, items) => {
    const values = items
      .map((item, index) => `('${escape(item.label)}', '${escape(item.group)}', ${index}, true, now(), now())`)
      .join(', ');
    pgm.sql(`INSERT INTO ${table} (label, "group", sort_order, is_active, created_at, updated_at)
      VALUES ${values}
      ON CONFLICT (label) DO NOTHING`);
  };

  const states = {
    SP: 'SP',
    RJ: 'RJ',
    MG: 'MG',
    ES: 'ES',
    BA: 'BA',
    RS: 'RS',
    SC: 'SC',
    PR: 'PR',
    PE: 'PE',
    CE: 'CE',
    DF: 'DF'
  };

  Object.entries(states).forEach(([code, name]) => {
    pgm.sql(
      `INSERT INTO states (code, name, created_at, updated_at)
       VALUES ('${escape(code)}', '${escape(name)}', now(), now())
       ON CONFLICT (code) DO NOTHING`
    );
  });

  const locations = {
    SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Guarulhos', 'Sorocaba', 'São José dos Campos'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Cabo Frio', 'Búzios', 'Petrópolis', 'Duque de Caxias', 'Nova Iguaçu'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Ouro Preto', 'Tiradentes', 'Juiz de Fora', 'Contagem', 'Betim'],
    ES: ['Vitória', 'Vila Velha', 'Guarapari', 'Serra', 'Cariacica'],
    BA: ['Salvador', 'Porto Seguro', 'Ilhéus'],
    RS: ['Porto Alegre', 'Gramado', 'Caxias do Sul'],
    SC: ['Florianópolis', 'Balneário Camboriú', 'Joinville'],
    PR: ['Curitiba', 'Foz do Iguaçu', 'Londrina'],
    PE: ['Recife', 'Olinda', 'Porto de Galinhas'],
    CE: ['Fortaleza', 'Jericoacoara'],
    DF: ['Brasília']
  };

  Object.entries(locations).forEach(([code, cities]) => {
    cities.forEach((city) => {
      pgm.sql(
        `INSERT INTO cities (state_id, name, created_at, updated_at)
         SELECT id, '${escape(city)}', now(), now() FROM states WHERE code = '${escape(code)}'
         ON CONFLICT (state_id, name) DO NOTHING`
      );
    });
  });

  const genders = [
    { label: 'Homem Hétero', group: 'masc' },
    { label: 'Homem Bi', group: 'masc' },
    { label: 'Homem Gay', group: 'masc' },
    { label: 'Homem Trans', group: 'masc' },
    { label: 'Mulher Hétero', group: 'fem' },
    { label: 'Mulher Bi', group: 'fem' },
    { label: 'Mulher Lésbica', group: 'fem' },
    { label: 'Mulher Trans', group: 'fem' },
    { label: 'Outro', group: 'other' }
  ];
  insertGender('genders', genders);
  insertGender('looking_for_options', genders);

  insertList('relationships', [
    'Casamento',
    'Namoro',
    'Amizade colorida',
    'Peguete',
    'Um pente e rala',
    'Trisal',
    'Suruba',
    'Nem eu sei o que quero'
  ]);

  insertList('classifications', [
    'Pobre Premium',
    'Dublê de Rico',
    'Velho da Lancha',
    'Jovem da Lancha',
    'Zilionário',
    'Sou chato, não quero me classificar',
    'Dublê de rica',
    'Rica',
    'Zilionária',
    'Sou chata, não quero me classificar'
  ]);

  insertList('bill_split_options', [
    'Pago a conta',
    'Racho a conta',
    'Sou uma princesa, meu date paga a conta',
    'Sou um princeso, meu date paga a conta'
  ]);

  insertList('tags', [
    'Chopinho gelado',
    'Litrão no pé sujo',
    'Encher a cara',
    'Uns bons drinks',
    'Vinho à dois',
    'Festa patrocinada',
    'Boate',
    'Sambinha e pagode',
    'Sertanejo e Forró',
    'Rock e Alterna',
    'Praia e água de côco',
    'Lancha e Jet',
    'Pedalinho na lagoa',
    'Passear com o totó',
    'Dar uma corrida',
    'Jantar à luz de velas',
    'Tomar um café',
    'Japa',
    'Podrão na pracinha',
    'Netflix',
    'Fumar',
    'Fazer um rala e rola',
    'Cinema e pipoca',
    'Rolezin no shopping',
    'Teatro',
    'Jogar videogame',
    'Jogar RPG'
  ]);

  insertList('educations', [
    'Ensino Médio',
    'Cursando Graduação',
    'Superior completo',
    'Pós-graduação',
    'Mestrado',
    'Doutorado'
  ]);

  insertList('families', ['Quero filhos', 'Não quero filhos', 'Tenho filhos', 'Talvez um dia']);

  insertList('signs', [
    'Áries',
    'Touro',
    'Gêmeos',
    'Câncer',
    'Leão',
    'Virgem',
    'Libra',
    'Escorpião',
    'Sagitário',
    'Capricórnio',
    'Aquário',
    'Peixes'
  ]);

  insertList('pets', ['Cachorro', 'Gato', 'Répteis', 'Pássaros', 'Não tenho', 'Amo todos']);

  insertList('drinks', ['Socialmente', 'Nunca', 'Frequentemente', 'Aos fins de semana']);

  insertList('smokes', ['Não fumo', 'Fumo socialmente', 'Fumo regularmente', 'Fumo quando bebo']);

  insertList('exercises', ['Todo dia', 'Frequentemente', 'Às vezes', 'Nunca']);

  insertList('foods', ['Vegano', 'Vegetariano', 'Onívoro', 'Carnívoro', 'Halal', 'Kosher']);

  insertList('sleeps', ['Madrugador', 'Coruja noturna', 'Dorme cedo', 'Insônia criativa']);

  insertList('personality_traits', [
    'Aventureiro',
    'Criativo',
    'Extrovertido',
    'Introvertido',
    'Romântico',
    'Engraçado',
    'Ambicioso',
    'Zen',
    'Festeiro',
    'Intelectual',
    'Caseiro',
    'Esportista',
    'Líder',
    'Empático'
  ]);
};

exports.down = (pgm) => {
  pgm.sql('DELETE FROM profile_personality');
  pgm.sql('DELETE FROM profile_looking_for');
  pgm.sql('DELETE FROM profile_tags');
  pgm.sql('DELETE FROM profile_photos');
  pgm.sql('DELETE FROM profiles');
  pgm.sql('DELETE FROM personality_traits');
  pgm.sql('DELETE FROM sleeps');
  pgm.sql('DELETE FROM foods');
  pgm.sql('DELETE FROM exercises');
  pgm.sql('DELETE FROM smokes');
  pgm.sql('DELETE FROM drinks');
  pgm.sql('DELETE FROM pets');
  pgm.sql('DELETE FROM signs');
  pgm.sql('DELETE FROM families');
  pgm.sql('DELETE FROM educations');
  pgm.sql('DELETE FROM tags');
  pgm.sql('DELETE FROM bill_split_options');
  pgm.sql('DELETE FROM classifications');
  pgm.sql('DELETE FROM relationships');
  pgm.sql('DELETE FROM looking_for_options');
  pgm.sql('DELETE FROM genders');
  pgm.sql('DELETE FROM cities');
  pgm.sql('DELETE FROM states');
};
