'use strict'

const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('receptions', 'center_id', {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'centers',
        key: 'id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('receptions', 'center_id')
  }
}
