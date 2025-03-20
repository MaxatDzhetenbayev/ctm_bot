'use strict'
const { DataType } = require('sequelize-typescript')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE "users" ADD CONSTRAINT "role_3_requires_center" 
      CHECK (role_id != 3 OR center_id IS NOT NULL);`
    );

  },
  async down(queryInterface) {

    await queryInterface.removeConstraint('users', 'role_3_requires_center');
  }
}
