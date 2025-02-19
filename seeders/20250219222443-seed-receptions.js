'use strict'

const { faker } = require('@faker-js/faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query(`SELECT id FROM users;`)
    const userIds = users[0].map(user => user.id)

    if (userIds.length < 2) {
      console.error(
        '❌ Недостаточно пользователей в базе для создания записей.'
      )
      return
    }

    const receptions = []
    const now = new Date()

    for (let i = 0; i < 100; i++) {
      const randomDate = new Date(now)
      randomDate.setDate(now.getDate() - Math.floor(Math.random() * 5)) // Последние 5 дней

      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      let managerId
      do {
        managerId = userIds[Math.floor(Math.random() * userIds.length)]
      } while (managerId === userId)

      receptions.push({
        user_id: userId,
        manager_id: managerId,
        date: randomDate.toISOString().split('T')[0],
        time: faker.helpers.arrayElement([
          '09:00',
          '10:30',
          '12:00',
          '14:00',
          '16:00'
        ]),
        status_id: Math.floor(Math.random() * 6) + 1,
        rating: Math.random() < 0.8 ? Math.floor(Math.random() * 5) + 1 : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await queryInterface.bulkInsert('receptions', receptions)
    console.log('✅ Добавлено 100 случайных записей в таблицу receptions.')
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('receptions', null, {})
    console.log('❌ Удалены все записи из таблицы receptions.')
  }
}
