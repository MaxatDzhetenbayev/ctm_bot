"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn("users", "role_id", {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn("users", "role_id", {
      type: DataTypes.INTEGER,
      defaultValue: 2,
    });
  },
};
