'use strict'

const { faker } = require('@faker-js/faker')
const bcrypt = require('bcrypt')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const users = []
    const profiles = []
    const roleId = 4

    for (let i = 0; i < 120; i++) {
      const authType = faker.helpers.arrayElement(['telegram', 'default'])
      const telegramId =
        authType === 'telegram'
          ? faker.number.int({ min: 100000000, max: 999999999 })
          : null
      const login = authType === 'default' ? faker.internet.username() : null
      const passwordHash = login ? await bcrypt.hash('password123', 10) : null

      const user = {
        auth_type: authType,
        telegram_id: telegramId,
        login: login,
        password_hash: passwordHash,
        role_id: roleId
      }

      users.push(user)
    }

    // Вставляем пользователей в базу
    const insertedUsers = await queryInterface.bulkInsert('users', users, {
      returning: true
    })

    insertedUsers.forEach(user => {
      profiles.push({
        id: user.id,
        full_name: faker.person.fullName(),
        iin: faker.number
          .int({ min: 900000000000, max: 999999999999 })
          .toString(),
        phone: faker.phone.number('+7##########')
      })
    })

    // ❌ Убираем `createdAt` и `updatedAt`, если их нет в таблице `profiles`
    await queryInterface.bulkInsert('profiles', profiles)
    console.log('✅ 120 фейковых клиентов добавлены в users и profiles.')
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('profiles', null, {})
    await queryInterface.bulkDelete('users', null, {})
    console.log('❌ Все фейковые клиенты удалены.')
  }
}
