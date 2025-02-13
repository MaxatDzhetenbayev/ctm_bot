"use strict";

const { DataType } = require("sequelize-typescript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await queryInterface.removeConstraint(
          "receptions",
          "receptions_user_id_fkey",
          { transaction }
        );

        await queryInterface.removeConstraint(
          "receptions",
          "receptions_manager_id_fkey",
          { transaction }
        );

        await queryInterface.addConstraint("receptions", {
          fields: ["user_id"],
          type: "foreign key",
          name: "receptions_user_id_fkey",
          references: {
            table: "users",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
          transaction,
        });

        await queryInterface.addConstraint("receptions", {
          fields: ["manager_id"],
          type: "foreign key",
          name: "receptions_manager_id_fkey",
          references: {
            table: "users",
            field: "id",
          },
          onDelete: "cascade",
          onUpdate: "cascade",
          transaction,
        });
      } catch (error) {
        console.error(
          "Ошибка при установке ограничений на удаление и обновление внешних ключей: " +
            error
        );
        throw error;
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await queryInterface.removeConstraint(
          "receptions",
          "receptions_user_id_fkey",
          { transaction }
        );
        await queryInterface.removeConstraint(
          "receptions",
          "receptions_manager_id_fkey",
          { transaction }
        );

        await queryInterface.addConstraint("receptions", {
          fields: ["user_id"],
          type: "foreign key",
          name: "receptions_user_id_fkey",
          references: {
            table: "users",
            field: "id",
          },

          onDelete: "no action",
          onUpdate: "no action",
          transaction,
        });

        await queryInterface.addConstraint("receptions", {
          fields: ["manager_id"],
          type: "foreign key",
          name: "receptions_manager_id_fkey",
          references: {
            table: "users",
            field: "id",
          },
          onDelete: "no action",
          onUpdate: "no action",
          transaction,
        });
      } catch (error) {
        console.log(
          "Ошибка при удалении ограничений на удаление и обновление внешних ключей: " +
            error
        );
        throw error;
      }
    });
  },
};
