"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("receptions", {
      id: {
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      manager_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      date: {
        type: DataType.DATE,
        allowNull: false,
      },
      time: {
        type: DataType.TIME,
        allowNull: false,
      },
      status_id: {
        type: DataType.INTEGER,
        allowNull: false,
        references: {
          model: "reception_statuses",
          key: "id",
        },
        defaultValue: 1,
      },
      rating: {
        type: DataType.INTEGER,
        allowNull: true,
      },
      createdAt: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
      },
      updatedAt: {
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("receptions");
  },
};
