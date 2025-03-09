"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("managers_table", "cabinet", {
      type: DataType.INTEGER,
      allowNull: false,
      defaultValue: 100, // default value for cabinet number
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("managers_table", "cabinet");
  },
};
