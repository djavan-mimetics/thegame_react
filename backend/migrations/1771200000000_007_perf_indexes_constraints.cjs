exports.up = (pgm) => {
  pgm.sql(`CREATE INDEX IF NOT EXISTS profiles_updated_user_idx
           ON profiles (updated_at DESC, user_id DESC)
           WHERE deleted_at IS NULL`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS profile_photos_active_user_order_idx
           ON profile_photos (user_id, order_index, created_at)
           WHERE deleted_at IS NULL`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS swipes_from_created_idx
           ON swipes (from_user_id, created_at DESC)`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS swipes_to_created_idx
           ON swipes (to_user_id, created_at DESC)`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS swipes_to_direction_created_idx
           ON swipes (to_user_id, direction, created_at DESC)`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS matches_created_idx
           ON matches (created_at DESC)`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS messages_match_created_desc_idx
           ON messages (match_id, created_at DESC)`);

  pgm.sql(`CREATE INDEX IF NOT EXISTS notifications_user_seen_created_idx
           ON notifications (user_id, seen, created_at DESC)`);

  pgm.sql(`ALTER TABLE swipes
           ADD CONSTRAINT swipes_direction_check
           CHECK (direction IN ('like', 'superlike', 'dislike', 'neutral'))`);

  pgm.sql(`ALTER TABLE notifications
           ADD CONSTRAINT notifications_type_check
           CHECK (type IN ('match', 'message', 'superlike', 'system'))`);
};

exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check`);
  pgm.sql(`ALTER TABLE swipes DROP CONSTRAINT IF EXISTS swipes_direction_check`);

  pgm.sql(`DROP INDEX IF EXISTS notifications_user_seen_created_idx`);
  pgm.sql(`DROP INDEX IF EXISTS messages_match_created_desc_idx`);
  pgm.sql(`DROP INDEX IF EXISTS matches_created_idx`);
  pgm.sql(`DROP INDEX IF EXISTS swipes_to_direction_created_idx`);
  pgm.sql(`DROP INDEX IF EXISTS swipes_to_created_idx`);
  pgm.sql(`DROP INDEX IF EXISTS swipes_from_created_idx`);
  pgm.sql(`DROP INDEX IF EXISTS profile_photos_active_user_order_idx`);
  pgm.sql(`DROP INDEX IF EXISTS profiles_updated_user_idx`);
};
