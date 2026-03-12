exports.up = async (pgm) => {
  pgm.addColumn('notifications', {
    payload: { type: 'jsonb', notNull: true, default: '{}' }
  });
};

exports.down = async (pgm) => {
  pgm.dropColumn('notifications', 'payload');
};