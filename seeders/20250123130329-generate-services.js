"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("services", [
      {
        name: JSON.stringify({
          kz: "Жұмыссыз ретінде тіркелу және тұрақты жұмысқа орналасу",
          ru: "Регистрация и трудоустройство безработных",
        }),
      },
      {
        name: JSON.stringify({
          kz: "Субсидияланатын жұмыс орындары",
          ru: "Субсидированные рабочие места",
        }),
      },
      {
        name: JSON.stringify({
          kz: "Қоғамдық жұмыстар",
          ru: "Общественные работы",
        }),
        parent_id: 2,
      },
      {
        name: JSON.stringify({
          kz: "Әлеуметтік жұмыстар",
          ru: "Социальные работы",
        }),
        parent_id: 2,
      },
      {
        name: JSON.stringify({
          kz: "«Күміс жас» жобасы",
          ru: "Программа «Серебряный возраст»",
        }),
        parent_id: 2,
      },
      {
        name: JSON.stringify({
          kz: "Жастар практикасы",
          ru: "Молодежная практика",
        }),
        parent_id: 2,
      },
      {
        name: JSON.stringify({
          kz: "Мүгедектігі бар адамдарға",
          ru: "Лицам с ограниченными возможностями",
        }),
        parent_id: 2,
      },
      {
        name: JSON.stringify({
          kz: "Қысқа мерзімді кәсіптік оқыту",
          ru: "Краткосрочное профессиональное обучение",
        }),
      },
      {
        name: JSON.stringify({
          kz: "Көші-қон",
          ru: "Миграция",
        }),
      },
      {
        name: JSON.stringify({
          kz: "Халықтың әлеуметтік осал тобын қолдау үшін жаңа бизнес-идеяларды іске асыруға берілетін 400 АЕК көлемінде қайтарымсыз гранттар",
          ru: "400 безвозвратных грантов на реализацию новых бизнес-идей для поддержки общественных молодежных объединений",
        }),
      },
      {
        name: JSON.stringify({
          kz: "Атаулы әлеуметтік көмек",
          ru: "Специальная социальная помощь",
        }),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("services", null, {});
  },
};
