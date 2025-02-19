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

    const availableSlots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30'
    ]

    const receptions = []
    const now = new Date()

    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const occupiedSlots = new Map()

    for (let i = 0; i < 10; i++) {
      if (!occupiedSlots.has(today)) {
        occupiedSlots.set(today, new Set())
      }

      const takenSlots = occupiedSlots.get(today)
      const freeSlots = availableSlots.filter(slot => !takenSlots.has(slot))

      if (freeSlots.length === 0) {
        console.warn(`⚠️ Все слоты заняты на сегодня! Освобождаем.`)
        occupiedSlots.set(today, new Set())
      }

      const selectedTime = faker.helpers.arrayElement(freeSlots)
      takenSlots.add(selectedTime)

      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      let managerId
      do {
        managerId = userIds[Math.floor(Math.random() * userIds.length)]
      } while (managerId === userId)

      receptions.push({
        user_id: userId,
        manager_id: managerId,
        date: today,
        time: selectedTime,
        status_id: Math.floor(Math.random() * 6) + 1,
        rating: Math.random() < 0.8 ? Math.floor(Math.random() * 5) + 1 : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    for (let i = 0; i < 90; i++) {
      const randomOffset = Math.floor(Math.random() * 6)
      const randomDate = new Date(now)
      randomDate.setDate(now.getDate() - randomOffset)

      const formattedDate = `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`

      if (!occupiedSlots.has(formattedDate)) {
        occupiedSlots.set(formattedDate, new Set())
      }

      const takenSlots = occupiedSlots.get(formattedDate)
      const freeSlots = availableSlots.filter(slot => !takenSlots.has(slot))

      if (freeSlots.length === 0) {
        console.warn(`⚠️ Все слоты заняты на ${formattedDate}, пропускаем.`)
        continue
      }

      const selectedTime = faker.helpers.arrayElement(freeSlots)
      takenSlots.add(selectedTime)

      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      let managerId
      do {
        managerId = userIds[Math.floor(Math.random() * userIds.length)]
      } while (managerId === userId)

      receptions.push({
        user_id: userId,
        manager_id: managerId,
        date: formattedDate,
        time: selectedTime,
        status_id: Math.floor(Math.random() * 6) + 1,
        rating: Math.random() < 0.8 ? Math.floor(Math.random() * 5) + 1 : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    await queryInterface.bulkInsert('receptions', receptions)
    console.log(
      '✅ Добавлено 100 случайных записей в таблицу receptions (включая сегодня).'
    )
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('receptions', null, {})
    console.log('❌ Удалены все записи из таблицы receptions.')
  }
}
