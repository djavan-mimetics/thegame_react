exports.up = async (pgm) => {
  pgm.addColumns('profile_preferences', {
    discovery_state_id: { type: 'integer', references: 'states', onDelete: 'set null' },
    discovery_city_id: { type: 'integer', references: 'cities', onDelete: 'set null' },
    profile_visible: { type: 'boolean', notNull: true, default: true },
    hide_age: { type: 'boolean', notNull: true, default: false },
    read_receipts_enabled: { type: 'boolean', notNull: true, default: true },
    allow_marketing_emails: { type: 'boolean', notNull: true, default: false }
  });
};

exports.down = async (pgm) => {
  pgm.dropColumns('profile_preferences', [
    'discovery_state_id',
    'discovery_city_id',
    'profile_visible',
    'hide_age',
    'read_receipts_enabled',
    'allow_marketing_emails'
  ]);
};