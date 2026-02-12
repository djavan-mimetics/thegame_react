exports.up = (pgm) => {
  pgm.createTable('swipes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    from_user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    to_user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    direction: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });
  pgm.addConstraint('swipes', 'swipes_unique_pair', { unique: ['from_user_id', 'to_user_id'] });
  pgm.addIndex('swipes', ['to_user_id', 'direction']);

  pgm.createTable('matches', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_a: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    user_b: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });
  pgm.addConstraint('matches', 'matches_unique_pair', { unique: ['user_a', 'user_b'] });
  pgm.addIndex('matches', ['user_a']);
  pgm.addIndex('matches', ['user_b']);

  pgm.createTable('messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    match_id: { type: 'uuid', notNull: true, references: 'matches', onDelete: 'cascade' },
    sender_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    body: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    read_at: { type: 'timestamptz' }
  });
  pgm.addIndex('messages', ['match_id', 'created_at']);

  pgm.createTable('notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    type: { type: 'text', notNull: true },
    title: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    seen: { type: 'boolean', notNull: true, default: false }
  });
  pgm.addIndex('notifications', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('notifications');
  pgm.dropTable('messages');
  pgm.dropTable('matches');
  pgm.dropTable('swipes');
};
