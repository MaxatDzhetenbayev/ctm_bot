'use strict'
const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      action: {
        type: DataType.INTEGER,
        allowNull: false
      },
      time: {
        type: DataType.TIME,
        allowNull: false
      },
      manager_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      center_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'centers',
          key: 'id'
        }
      }
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs')
  }
}
