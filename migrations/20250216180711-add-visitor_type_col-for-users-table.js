"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn("users", "visitor_type_id", {
      type: DataType.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "visitor_types",
        key: "id",
        onDelete: "cascade",
        onUpdate: "cascade",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "visitor_type_id");
  },
};
