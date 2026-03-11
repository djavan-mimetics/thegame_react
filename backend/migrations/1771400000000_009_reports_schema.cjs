exports.up = (pgm) => {
  pgm.createTable('reports', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    reporter_user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    accused_user_id: { type: 'uuid', references: 'users', onDelete: 'set null' },
    offender_name: { type: 'text', notNull: true },
    occurred_on: { type: 'date', notNull: true },
    reason: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'Pendente' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addConstraint('reports', 'reports_status_valid', {
    check: "status IN ('Pendente','Em Análise','Resolvido')"
  });
  pgm.addIndex('reports', ['reporter_user_id', 'created_at']);
  pgm.addIndex('reports', ['accused_user_id', 'created_at']);

  pgm.createTable('report_updates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    report_id: { type: 'uuid', notNull: true, references: 'reports', onDelete: 'cascade' },
    sender: { type: 'text', notNull: true },
    text: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addConstraint('report_updates', 'report_updates_sender_valid', {
    check: "sender IN ('user','support')"
  });
  pgm.addIndex('report_updates', ['report_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('report_updates');
  pgm.dropTable('reports');
};
