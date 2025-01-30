"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "user",
      },
      {
        name: "manager",
      },
      {
        name: "hr",
      },
      {
        name: "admin",
      },
      {
        name: "superadmin",
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
