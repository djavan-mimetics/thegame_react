exports.up = async (pgm) => {
  pgm.createExtension('postgis', { ifNotExists: true });

  // For gen_random_uuid()
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text' },
    status: { type: 'text', notNull: true, default: 'active' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.createTable('user_identities', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    provider: { type: 'text', notNull: true },
    provider_subject: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });
  pgm.addConstraint('user_identities', 'user_identities_pk', {
    primaryKey: ['user_id', 'provider']
  });
  pgm.addConstraint('user_identities', 'user_identities_provider_subject_unique', {
    unique: ['provider', 'provider_subject']
  });

  pgm.createTable('sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    refresh_token_hash: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    revoked_at: { type: 'timestamptz' }
  });
  pgm.createIndex('sessions', ['user_id', 'created_at']);

  pgm.createTable('password_reset_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    consumed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });
  pgm.createIndex('password_reset_tokens', ['user_id', 'created_at']);
};

exports.down = async (_pgm) => {
  // Keep extension on down by default; no-op.
};
