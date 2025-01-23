"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "admin",
      },
      {
        name: "hr",
      },
      {
        name: "manager",
      },
      {
        name: "user",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
	 await queryInterface.bulkDelete("roles", null, {});
  },
};
