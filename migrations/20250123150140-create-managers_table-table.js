"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("managers_table", {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      manager_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      center_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: "centers",
          key: "id",
        },
      },
      table: {
        type: DataType.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("managers_table");
  },
};
