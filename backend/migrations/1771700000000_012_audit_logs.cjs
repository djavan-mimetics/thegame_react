exports.up = async (pgm) => {
  pgm.createTable('audit_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    actor_user_id: { type: 'uuid', references: 'users', onDelete: 'set null' },
    target_user_id: { type: 'uuid', references: 'users', onDelete: 'set null' },
    action: { type: 'text', notNull: true },
    request_id: { type: 'text' },
    ip_address: { type: 'text' },
    user_agent: { type: 'text' },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.createIndex('audit_logs', ['action', 'created_at']);
  pgm.createIndex('audit_logs', ['actor_user_id', 'created_at']);
  pgm.createIndex('audit_logs', ['target_user_id', 'created_at']);
};

exports.down = async (pgm) => {
  pgm.dropTable('audit_logs');
};
