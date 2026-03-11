exports.up = async (pgm) => {
  pgm.addColumns('users', {
    email_verified_at: { type: 'timestamptz' }
  });

  pgm.createTable('email_verification_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    consumed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.createIndex('email_verification_tokens', ['user_id', 'created_at']);

  pgm.sql(`
    UPDATE users
    SET email_verified_at = now()
    WHERE password_hash IS NOT NULL
      AND email_verified_at IS NULL
  `);
};

exports.down = async (pgm) => {
  pgm.dropTable('email_verification_tokens');
  pgm.dropColumns('users', ['email_verified_at']);
};
