exports.up = (pgm) => {
  pgm.createTable('subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    provider: { type: 'text', notNull: true, default: 'stripe' },
    provider_customer_id: { type: 'text' },
    provider_subscription_id: { type: 'text' },
    plan: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'inactive' },
    current_period_end: { type: 'timestamptz' },
    cancel_at_period_end: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addIndex('subscriptions', ['user_id', 'created_at']);
  pgm.addIndex('subscriptions', ['status', 'created_at']);
  pgm.addIndex('subscriptions', ['provider', 'provider_subscription_id']);

  pgm.createTable('payments', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
    subscription_id: { type: 'uuid', references: 'subscriptions', onDelete: 'set null' },
    provider: { type: 'text', notNull: true, default: 'stripe' },
    provider_payment_id: { type: 'text' },
    amount_cents: { type: 'integer', notNull: true, default: 0 },
    currency: { type: 'text', notNull: true, default: 'brl' },
    status: { type: 'text', notNull: true, default: 'pending' },
    card_last4: { type: 'text' },
    raw_json: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addIndex('payments', ['user_id', 'created_at']);
  pgm.addIndex('payments', ['provider', 'provider_payment_id']);
};

exports.down = (pgm) => {
  pgm.dropTable('payments');
  pgm.dropTable('subscriptions');
};
