module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "ALTER TYPE enum_users_auth_type ADD VALUE 'offline'"
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      "DELETE FROM pg_enum WHERE enumlabel = 'offline' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_users_auth_type')"
    )
  }
}
