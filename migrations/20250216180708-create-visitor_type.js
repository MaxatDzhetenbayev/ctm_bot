const { DataTypes } = require("sequelize")

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("visitor_types", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("visitor_types");
  }
}



// Создать миграцию и модель типа пользователя visitor_type работодателя и соискателя
// Создать сиды для типа пользователя visitor_type работодателя и соискателя

// Поменять миграцию и модель сервися добавив туда id типа visitor_type
// Поменять сиды сервиса добавив туда id типа visitor_type

// Добавить в миграцию и модель receptions поля id типа visitor_type и id типа сервиса

// Поменять создания receptions, где он теперь принимает id типа сервиса
// При получений менеджером всех его receptions, он должен получить и тип сервиса, который выбрал пользователь и тип пользователя в детальной информации о пользователе

// Пользователь должен иметь возможность выбрать тип пользователя при регистрации и также его менять в настройках бота
