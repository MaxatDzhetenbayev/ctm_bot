'use strict'
const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('manager_statuses', {
      manager_id: {
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataType.ENUM,
        allowNull: false,
        defaultValue: 'offline',
        values: ['online', 'offline']
      }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('manager_statuses')
  }
}
