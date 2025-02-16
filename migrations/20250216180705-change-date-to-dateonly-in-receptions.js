module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('receptions', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('receptions', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    })
  }
}