const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Удаляем уникальный индекс, если он существует
    await queryInterface.removeConstraint("services", "services_name_key").catch(() => { });

    // Меняем тип столбца
    await queryInterface.changeColumn("services", "name", {
      type: DataTypes.JSONB,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем старое ограничение, если вдруг оно есть
    await queryInterface.removeConstraint("services", "services_name_key").catch(() => { });

    // Меняем тип столбца обратно
    await queryInterface.changeColumn("services", "name", {
      type: DataTypes.JSONB,
    });

    // Добавляем уникальный индекс обратно
    await queryInterface.addConstraint("services", {
      fields: ["name"],
      type: "unique",
      name: "services_name_key",
    });
  },
};
