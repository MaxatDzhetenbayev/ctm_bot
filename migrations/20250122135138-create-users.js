"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("users", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      auth_type: {
        type: DataTypes.ENUM,
        values: ["telegram", "default", "offline"],
        allowNull: false,
        defaultValue: "telegram",
      },
      telegram_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
		  defaultValue: 2,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  },
};
