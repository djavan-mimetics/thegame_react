exports.up = async (pgm) => {
  pgm.createTable('profile_preferences', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'cascade' },
    min_age: { type: 'integer', notNull: true, default: 18 },
    max_age: { type: 'integer', notNull: true, default: 94 },
    max_distance_km: { type: 'integer', notNull: true, default: 35 },
    expand_distance: { type: 'boolean', notNull: true, default: true },
    expand_age: { type: 'boolean', notNull: true, default: false },
    international_mode: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  pgm.addConstraint('profile_preferences', 'profile_preferences_age_range_check', {
    check: 'min_age >= 18 AND max_age <= 100 AND min_age <= max_age'
  });
  pgm.addConstraint('profile_preferences', 'profile_preferences_distance_check', {
    check: 'max_distance_km >= 1 AND max_distance_km <= 500'
  });
};

exports.down = async (pgm) => {
  pgm.dropTable('profile_preferences');
};