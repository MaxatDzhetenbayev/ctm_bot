'use strict'

const { faker } = require('@faker-js/faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const users = await queryInterface.sequelize.query(`SELECT id FROM users;`)
    const managers = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role_id = 3;`
    )

    if (!users[0] || users[0].length < 2) {
      console.error('❌ Недостаточно пользователей в базе (нужно минимум 2).')
      return
    }

    if (!managers[0] || managers[0].length === 0) {
      console.error('❌ В базе нет менеджеров (role_id = 3).')
      return
    }

    const userIds = users[0].map(user => user.id)
    const managerIds = managers[0].map(manager => manager.id)

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
    const occupiedSlots = new Map()

    for (let i = 0; i < 1000; i++) {
      const randomOffset = Math.floor(Math.random() * 6)
      const randomDate = new Date(now)
      randomDate.setDate(now.getDate() - randomOffset)

      const formattedDate = `${randomDate.getFullYear()}-${String(
        randomDate.getMonth() + 1
      ).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`

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
      const managerId =
        managerIds[Math.floor(Math.random() * managerIds.length)]

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

      // Вставляем каждые 200 записddddей (batch insert)
      if (receptions.length >= 200) {
        await queryInterface.bulkInsert('receptions', receptions)
        receptions.length = 0 // Очищаем массив после вставки
        console.log(`✅ Вставлено ${i + 1} записей...`)
      }
    }

    // Вставляем оставшиеся записи
    if (receptions.length > 0) {
      await queryInterface.bulkInsert('receptions', receptions)
    }

    console.log('✅ 1000 записей успешно добавлены в таблицу receptions.')
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('receptions', null, {})
    console.log('❌ Удалены все записи из таблицы receptions.')
  }
}
