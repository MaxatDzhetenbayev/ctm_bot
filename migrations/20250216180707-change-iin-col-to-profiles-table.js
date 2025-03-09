const { DataTypes } = require("sequelize")

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('profiles', 'iin', {
      type: DataTypes.STRING,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('profiles', 'iin', {
      type: DataTypes.STRING,
      allowNull: false,
    })
  }
}