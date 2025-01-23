"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("roles", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["admin", "user", "manager", "hr"],
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("roles");
  },
};
