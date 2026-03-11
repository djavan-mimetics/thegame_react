exports.up = (pgm) => {
  const assignLocation = (email, stateCode, cityName) => {
    pgm.sql(
      `UPDATE profiles p
       SET state_id = s.id,
           city_id = c.id,
           updated_at = now()
       FROM users u
       JOIN states s ON s.code = '${stateCode}'
       JOIN cities c ON c.state_id = s.id AND c.name = '${cityName}'
       WHERE u.email = '${email}'
         AND p.user_id = u.id`
    );
  };

  assignLocation('demo1@thegame.local', 'RJ', 'Rio de Janeiro');
  assignLocation('demo2@thegame.local', 'RJ', 'Niterói');
  assignLocation('demo3@thegame.local', 'RJ', 'Rio de Janeiro');

  assignLocation('seed.rafael@thegame.local', 'RJ', 'Rio de Janeiro');
  assignLocation('seed.bruna@thegame.local', 'RJ', 'Niterói');
  assignLocation('seed.lucas@thegame.local', 'SP', 'São Paulo');
  assignLocation('seed.camila@thegame.local', 'RJ', 'Rio de Janeiro');
  assignLocation('seed.gabriel@thegame.local', 'SP', 'Campinas');
  assignLocation('seed.isabela@thegame.local', 'RJ', 'Rio de Janeiro');
};

exports.down = (pgm) => {
  pgm.sql(
    `UPDATE profiles p
     SET state_id = NULL,
         city_id = NULL,
         updated_at = now()
     FROM users u
     WHERE p.user_id = u.id
       AND (u.email LIKE 'demo%@thegame.local' OR u.email LIKE 'seed.%@thegame.local')`
  );
};
