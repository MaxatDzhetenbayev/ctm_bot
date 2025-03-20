'use strict'

const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable('service_visitor_types', {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      service_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      visitor_type_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: 'service_visitor_types',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('service_visitor_types')
  }
}
