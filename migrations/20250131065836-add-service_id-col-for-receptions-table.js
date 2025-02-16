"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("receptions", "service_id", {
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: "services",
        key: "id",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("receptions", "service_id");
  },
};
