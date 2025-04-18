"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("reception_statuses", [
      {
        name: "assignment",
      },
      {
        name: "pending",
      },
      {
        name: "working",
      },
      {
        name: "done",
      },
      {
        name: "canceled",
      },
      {
        name: "no-show",
      },
      {
        name: "called",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("services", null, {});
  },
};
