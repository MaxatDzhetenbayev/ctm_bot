'use strict'

const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('services', 'visitor_type_id')
  },

  async down(queryInterface) {
    await queryInterface.addColumn('services', 'visitor_type_id', {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'visitor_types',
        key: 'id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })
  }
}
