/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
	const auditColumns = {
		created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
		updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
	};

	const createLookup = (table) => {
		pgm.createTable(table, {
			id: 'serial',
			label: { type: 'text', notNull: true },
			sort_order: { type: 'integer', notNull: true, default: 0 },
			is_active: { type: 'boolean', notNull: true, default: true },
			...auditColumns
		});
		pgm.addConstraint(table, `${table}_label_unique`, { unique: ['label'] });
		pgm.addIndex(table, ['sort_order']);
	};

	pgm.createTable('states', {
		id: 'serial',
		code: { type: 'varchar(2)', notNull: true },
		name: { type: 'text', notNull: true },
		...auditColumns
	});
	pgm.addConstraint('states', 'states_code_unique', { unique: ['code'] });
	pgm.addConstraint('states', 'states_name_unique', { unique: ['name'] });

	pgm.createTable('cities', {
		id: 'serial',
		state_id: { type: 'integer', notNull: true, references: 'states', onDelete: 'cascade' },
		name: { type: 'text', notNull: true },
		...auditColumns
	});
	pgm.addConstraint('cities', 'cities_state_name_unique', { unique: ['state_id', 'name'] });
	pgm.addIndex('cities', ['state_id', 'name']);

	pgm.createTable('genders', {
		id: 'serial',
		label: { type: 'text', notNull: true },
		group: { type: 'text', notNull: true },
		sort_order: { type: 'integer', notNull: true, default: 0 },
		is_active: { type: 'boolean', notNull: true, default: true },
		...auditColumns
	});
	pgm.addConstraint('genders', 'genders_label_unique', { unique: ['label'] });
	pgm.addIndex('genders', ['group', 'sort_order']);

	pgm.createTable('looking_for_options', {
		id: 'serial',
		label: { type: 'text', notNull: true },
		group: { type: 'text', notNull: true },
		sort_order: { type: 'integer', notNull: true, default: 0 },
		is_active: { type: 'boolean', notNull: true, default: true },
		...auditColumns
	});
	pgm.addConstraint('looking_for_options', 'looking_for_options_label_unique', { unique: ['label'] });
	pgm.addIndex('looking_for_options', ['group', 'sort_order']);

	createLookup('relationships');
	createLookup('classifications');
	createLookup('bill_split_options');
	createLookup('tags');
	createLookup('educations');
	createLookup('families');
	createLookup('signs');
	createLookup('pets');
	createLookup('drinks');
	createLookup('smokes');
	createLookup('exercises');
	createLookup('foods');
	createLookup('sleeps');
	createLookup('personality_traits');

	pgm.createTable('profiles', {
		user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'cascade' },
		name: { type: 'text', notNull: true },
		birth_date: { type: 'date' },
		state_id: { type: 'integer', references: 'states', onDelete: 'set null' },
		city_id: { type: 'integer', references: 'cities', onDelete: 'set null' },
		gender_id: { type: 'integer', references: 'genders', onDelete: 'set null' },
		height_cm: { type: 'integer' },
		bio: { type: 'text' },
		ranking_enabled: { type: 'boolean', notNull: true, default: false },
		available_today: { type: 'boolean', notNull: true, default: false },
		current_tag_id: { type: 'integer', references: 'tags', onDelete: 'set null' },
		classification_id: { type: 'integer', references: 'classifications', onDelete: 'set null' },
		bill_split_id: { type: 'integer', references: 'bill_split_options', onDelete: 'set null' },
		relationship_id: { type: 'integer', references: 'relationships', onDelete: 'set null' },
		education_id: { type: 'integer', references: 'educations', onDelete: 'set null' },
		family_id: { type: 'integer', references: 'families', onDelete: 'set null' },
		sign_id: { type: 'integer', references: 'signs', onDelete: 'set null' },
		pets_id: { type: 'integer', references: 'pets', onDelete: 'set null' },
		drink_id: { type: 'integer', references: 'drinks', onDelete: 'set null' },
		smoke_id: { type: 'integer', references: 'smokes', onDelete: 'set null' },
		exercise_id: { type: 'integer', references: 'exercises', onDelete: 'set null' },
		food_id: { type: 'integer', references: 'foods', onDelete: 'set null' },
		sleep_id: { type: 'integer', references: 'sleeps', onDelete: 'set null' },
		...auditColumns,
		deleted_at: { type: 'timestamptz' }
	});
	pgm.addIndex('profiles', ['city_id']);
	pgm.addIndex('profiles', ['gender_id']);
	pgm.addIndex('profiles', ['available_today']);

	pgm.createTable('profile_photos', {
		id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
		user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
		gcs_path: { type: 'text', notNull: true },
		public_url: { type: 'text' },
		width: { type: 'integer' },
		height: { type: 'integer' },
		order_index: { type: 'integer', notNull: true, default: 0 },
		is_primary: { type: 'boolean', notNull: true, default: false },
		created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
		deleted_at: { type: 'timestamptz' }
	});
	pgm.addConstraint('profile_photos', 'profile_photos_user_order_unique', {
		unique: ['user_id', 'order_index']
	});
	pgm.addIndex('profile_photos', ['user_id', 'created_at']);

	pgm.createTable('profile_tags', {
		user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
		tag_id: { type: 'integer', notNull: true, references: 'tags', onDelete: 'cascade' }
	});
	pgm.addConstraint('profile_tags', 'profile_tags_pk', { primaryKey: ['user_id', 'tag_id'] });
	pgm.addIndex('profile_tags', ['tag_id']);

	pgm.createTable('profile_looking_for', {
		user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
		looking_for_id: { type: 'integer', notNull: true, references: 'looking_for_options', onDelete: 'cascade' }
	});
	pgm.addConstraint('profile_looking_for', 'profile_looking_for_pk', { primaryKey: ['user_id', 'looking_for_id'] });
	pgm.addIndex('profile_looking_for', ['looking_for_id']);

	pgm.createTable('profile_personality', {
		user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'cascade' },
		personality_id: { type: 'integer', notNull: true, references: 'personality_traits', onDelete: 'cascade' }
	});
	pgm.addConstraint('profile_personality', 'profile_personality_pk', { primaryKey: ['user_id', 'personality_id'] });
	pgm.addIndex('profile_personality', ['personality_id']);

	pgm.addColumns('sessions', {
		last_used_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
		absolute_expires_at: { type: 'timestamptz', notNull: true, default: pgm.func("now() + interval '365 days'") }
	});
	pgm.addIndex('sessions', ['absolute_expires_at']);

	pgm.createTable('session_refresh_tokens', {
		id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
		session_id: { type: 'uuid', notNull: true, references: 'sessions', onDelete: 'cascade' },
		refresh_token_hash: { type: 'text', notNull: true },
		revoked_at: { type: 'timestamptz' },
		created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
	});
	pgm.addConstraint('session_refresh_tokens', 'session_refresh_tokens_hash_unique', {
		unique: ['refresh_token_hash']
	});
	pgm.addIndex('session_refresh_tokens', ['session_id', 'created_at']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable('session_refresh_tokens');
	pgm.dropColumns('sessions', ['absolute_expires_at', 'last_used_at']);
	pgm.dropTable('profile_personality');
	pgm.dropTable('profile_looking_for');
	pgm.dropTable('profile_tags');
	pgm.dropTable('profile_photos');
	pgm.dropTable('profiles');

	pgm.dropTable('personality_traits');
	pgm.dropTable('sleeps');
	pgm.dropTable('foods');
	pgm.dropTable('exercises');
	pgm.dropTable('smokes');
	pgm.dropTable('drinks');
	pgm.dropTable('pets');
	pgm.dropTable('signs');
	pgm.dropTable('families');
	pgm.dropTable('educations');
	pgm.dropTable('tags');
	pgm.dropTable('bill_split_options');
	pgm.dropTable('classifications');
	pgm.dropTable('relationships');
	pgm.dropTable('looking_for_options');
	pgm.dropTable('genders');
	pgm.dropTable('cities');
	pgm.dropTable('states');
};
