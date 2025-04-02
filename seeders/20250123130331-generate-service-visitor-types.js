'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('service_visitor_types', [
      {
        service_id: 1,
        visitor_type_id: 1
      },
      {
        service_id: 1,
        visitor_type_id: 2
      },
      {
        service_id: 2,
        visitor_type_id: 1
      },
      {
        service_id: 2,
        visitor_type_id: 2
      },
      {
        service_id: 3,
        visitor_type_id: 1
      },
      {
        service_id: 3,
        visitor_type_id: 2
      },
      {
        service_id: 4,
        visitor_type_id: 1
      },
      {
        service_id: 4,
        visitor_type_id: 2
      },
      {
        service_id: 5,
        visitor_type_id: 1
      },
      {
        service_id: 5,
        visitor_type_id: 2
      },
      {
        service_id: 6,
        visitor_type_id: 1
      },
      {
        service_id: 6,
        visitor_type_id: 2
      },
      {
        service_id: 7,
        visitor_type_id: 1
      },
      {
        service_id: 7,
        visitor_type_id: 2
      },
      {
        service_id: 8,
        visitor_type_id: 1
      },
      {
        service_id: 8,
        visitor_type_id: 2
      },
      {
        service_id: 9,
        visitor_type_id: 2
      },
      {
        service_id: 10,
        visitor_type_id: 2
      },
      {
        service_id: 11,
        visitor_type_id: 2
      },
      {
        service_id: 12,
        visitor_type_id: 2
      },
      {
        service_id: 13,
        visitor_type_id: 2
      }
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_visitor_types', null, {})
  }
}
