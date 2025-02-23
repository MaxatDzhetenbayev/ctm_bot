module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('profiles', 'iin', {
      type: Sequelize.STRING,
      allowNull: true
    })

    await queryInterface.changeColumn('profiles', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('profiles', 'iin', {
      type: Sequelize.STRING,
      allowNull: false
    })

    await queryInterface.changeColumn('profiles', 'phone', {
      type: Sequelize.STRING,
      allowNull: false
    })
  }
}
