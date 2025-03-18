'use strict'
const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('users', 'center_id', {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'centers',
        key: 'id',
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }
    })


  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'center_id');
  }
}
