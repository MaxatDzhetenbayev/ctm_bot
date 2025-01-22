"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("profiles", {
      id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      iin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("profiles");
  },
};
