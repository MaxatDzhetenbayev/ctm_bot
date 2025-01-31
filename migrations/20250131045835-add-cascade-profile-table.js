"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeConstraint("profiles", "profiles_id_fkey");

    await queryInterface.addConstraint("profiles", {
      fields: ["id"],
      type: "foreign key",
      name: "profiles_id_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "cascade",
      onUpdate: "cascade",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("profiles", "profiles_id_fkey");
  },
};
