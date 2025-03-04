'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable('managers_table', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      manager_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'centers',
          key: 'id',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        }
      },
      table: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable('managers_table');
  }
};
