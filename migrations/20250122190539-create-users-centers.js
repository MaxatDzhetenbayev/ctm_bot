"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("users_centers", {
      id: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataType.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      center_id: {
        type: DataType.INTEGER,
        references: {
          model: "centers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("users_centers");
  },
};
