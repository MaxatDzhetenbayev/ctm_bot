import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Sequelize } from 'sequelize-typescript'
import sequelize from 'sequelize'
import * as moment from 'moment'

import { Center } from '../centers/entities/center.entity'
import { Reception } from './entities/reception.entity'
import { AuthType, User } from 'src/general/users/entities/user.entity'
import { Service } from '../services/entities/service.entity'
import { Role, RoleType } from 'src/general/users/entities/role.entity'
import { Profile } from '../users/entities/profile.entity'
import { Status } from 'src/status/entities/status.entity'
import { VisitorTypesTable } from '../users/entities/visitor_types.entity'
import { UsersService } from '../users/users.service'
import { Telegraf } from 'telegraf'
import { InjectBot } from 'nestjs-telegraf'
import { createOffLineReceptionDto } from './dto/create-reception.dto'

@Injectable()
export class ReceptionsService {
  constructor(
    @InjectModel(Reception)
    private receptionRepository: typeof Reception,
    @InjectModel(User)
    private userRepository: typeof User,
    private readonly sequelize: Sequelize,
    private readonly userService: UsersService,
    @InjectBot() private readonly bot: Telegraf
  ) { }

  logger = new Logger(ReceptionsService.name)

  async create(body: {
    user_id: number
    manager_id: number
    date: string
    time: string
    status_id: number
  }) {
    try {
      const reception = await this.receptionRepository.create(body)

      return reception
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при создании приема')
    }
  }

  async findAll(id: number) {
    try {
      const receptions = await this.receptionRepository.findAll({
        where: {
          date: moment(),
          manager_id: id
        },
        attributes: ['id', 'date', 'time', 'rating'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Profile,
                attributes: ['iin', 'full_name', 'phone']
              }
            ]
          },
          {
            model: Status,
            attributes: ['name', 'id']
          }
        ],
        order: [['time', 'ASC']]
      })
      return receptions
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении списка приемов'
      )
    }
  }

  async findByUserTelegramId(telegramId: string) {
    try {
      this.logger.log(`Получение приема по telegramId ${telegramId}`)
      const user = await this.userRepository.findOne({
        where: {
          telegram_id: telegramId
        }
      })

      if (!user) {
        throw new NotFoundException('Пользователь не найден')
      }

      const receptions = await this.receptionRepository.findAll({
        where: {
          user_id: user.id
        },
        include: [
          {
            model: Status,
            attributes: ['name']
          },
          {
            model: Service,
            attributes: ['name']
          },
          {
            model: User,
            as: 'manager',
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Profile,
                attributes: ['iin', 'full_name', 'phone']
              }
            ]
          }
        ],
        limit: 5
      })

      if (receptions.length === 0) {
        return []
      }

      return receptions
    } catch (error) {
      this.logger.error(`Ошибка при получении приема: ${error}`)
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при получении приема')
    }
  }

  async findOne(id: number) {
    try {
      this.logger.log(`Получение приема ${id}`)
      const reception = await this.receptionRepository.findOne({
        where: {
          id
        },
        attributes: ['id', 'date', 'time', 'rating'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Profile,
                attributes: ['iin', 'full_name', 'phone']
              },
              {
                model: VisitorTypesTable,
                attributes: ['name']
              }
            ]
          },
          {
            model: Status,
            attributes: ['name']
          },
          {
            model: Service,
            attributes: ['name']
          }
        ]
      })

      if (!reception) {
        throw new NotFoundException('Прием не найден')
      }

      return reception
    } catch (error) {
      this.logger.error(`Ошибка при получении приема: ${error}`)
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при получении приема')
    }
  }

  async changeReceptionStatus(receptionId: number, statusId: number) {
    this.logger.log(`Принятие приема ${receptionId}`)
    const now = new Date()
    try {
      const reception = await this.receptionRepository.findOne({
        where: {
          id: receptionId
        }
      })
      if (!reception) {
        throw new NotFoundException('Прием не найден')
      }

      reception.status_id = statusId
      await reception.save()


      const { telegram_id } = await reception.$get('user')

      if (statusId == 7) {
        this.bot.telegram.sendMessage(
          telegram_id,
          'Вы приглашены на прием. Пожалуйста, зайдите в кабинет.'
        )
      } else if (statusId == 6) {
        this.bot.telegram.sendMessage(
          telegram_id,
          'Вы не явились на прием. Пожалуйста, запишитесь заново, если вам все еще нужна услуга.'
        )
      }

      return reception
    } catch (error) {
      this.logger.error(`Ошибка при изменении статуса приема: ${error}`)

      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(
        'Ошибка при изменении статуса приема'
      )
    }
  }

  async findFreeTimeSlots(centerId: number, serviceId: number, date: string) {
    try {
      const availableSlots = [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
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

      const currentTime = moment().format('HH:mm')
      const filteredSlots =
        date === moment().format('YYYY-MM-DD')
          ? availableSlots.filter(slot => slot > currentTime)
          : availableSlots

      const managers = await this.userRepository.findAll({
        include: [
          {
            model: Center,
            where: { id: centerId }
          },
          {
            model: Service,
            where: { id: serviceId }
          },
          {
            model: Role,
            where: { name: 'manager' }
          },
          {
            model: Reception,
            as: 'manager_works',
            required: false,
            where: {
              date,
              status_id: {
                [sequelize.Op.not]: 5
              }
            }
          }
        ]
      })

      const freeSlotsPerManager = managers.map(manager => {
        const bookedSlots = new Set()
        if (manager.manager_works) {
          manager.manager_works.forEach(reception => {
            const bookedTime = reception.time.substring(0, 5)
            bookedSlots.add(bookedTime)
          })
        }

        const freeSlots = filteredSlots.filter(slot => !bookedSlots.has(slot))
        return {
          managerId: manager.id,
          freeSlots
        }
      })

      const globalFreeSlots = new Set()
      freeSlotsPerManager.forEach(({ freeSlots }) => {
        freeSlots.forEach(slot => globalFreeSlots.add(slot))
      })

      return Array.from(globalFreeSlots).sort()
    } catch (error) {
      throw new InternalServerErrorException(
        'Ошибка при получении расписания приемов'
      )
    }
  }

  async choiceManager(body: {
    center_id: number
    service_id: number
    user_id: number
    date: string
    time: string
  }) {
    const { date, time, center_id, service_id, user_id } = body

    try {
      const managers = await this.userRepository.findAll({
        attributes: ['id'],
        include: [
          {
            model: Role,
            attributes: [],
            where: { name: 'manager' }
          },
          {
            model: Center,
            where: { id: center_id },
            attributes: []
          },
          {
            attributes: [],
            model: Service,
            where: { id: service_id }
          },
          {
            model: Reception,
            as: 'manager_works',
            required: false,
            where: {
              date,
              time
            },
            attributes: []
          }
        ],
        where: sequelize.literal('manager_works.id IS NULL')
      })

      const managersIds = managers.map(manager => manager.id)

      const leastBusyManagersAsc = await this.userRepository.findAll({
        attributes: {
          exclude: [
            'auth_type',
            'telegram_id',
            'password_hash',
            'role_id',
            'login'
          ],
          include: [
            [
              sequelize.cast(
                sequelize.fn('COUNT', sequelize.col('manager_works.id')),
                'INTEGER'
              ),
              'receptions_count'
            ]
          ]
        },
        include: [
          {
            model: Reception,
            as: 'manager_works',
            required: false,
            where: {
              date
            },
            attributes: []
          },
          {
            model: Center,
            attributes: ['name'],
            where: { id: center_id },
            through: { attributes: [] }
          },
          {
            model: Service,
            attributes: ['name'],
            where: { id: service_id },
            through: { attributes: [] }
          }
        ],
        where: {
          id: managersIds
        },
        group: ['User.id', 'centers.id', 'services.id'],
        order: [[sequelize.literal('receptions_count'), 'ASC']]
      })

      const leastBusyManager = leastBusyManagersAsc[0]

      if (!leastBusyManager) {
        throw new InternalServerErrorException('Нет свободных менеджеров')
      }

      const reception = await this.receptionRepository.create({
        user_id,
        manager_id: leastBusyManager.id,
        service_id: service_id,
        status_id: 2,
        date,
        time,
        center_id: center_id
      })

      if (!reception) {
        this.logger.error('Ошибка при создании приема')
        throw new InternalServerErrorException('Ошибка при создании приема')
      }

      const managerProfile = await leastBusyManager.$get('profile')

      const { table, cabinet } = await leastBusyManager.$get('manager_table')

      const center = leastBusyManager.get('centers')[0].name
      const service = leastBusyManager.get('services')[0].name
      return {
        reception,
        profile: managerProfile,
        table,
        cabinet,
        center,
        service
      }
    } catch (error) {
      this.logger.error(`Ошибка при выборе менеджера: ${error}`)
      throw new InternalServerErrorException('Ошибка при выборе менеджера')
    }
  }

  async createOffLiineReceptions(
    body: createOffLineReceptionDto,
    manager: { id: number; login: string; role: string; center_id: number }
  ) {
    const currentDate = moment().format('YYYY-MM-DD')
    const currentTime = moment().format('HH:mm:ss')
    const { service_id, visitor_type_id, ...profile } = body

    try {
      const createdUser = await this.userService.createUser({
        dto: {
          profile: profile,
          auth_type: AuthType.offline,
          role: RoleType.user,
          visitor_type: visitor_type_id
        }
      })

      const reception = await this.receptionRepository.create({
        user_id: createdUser.id,
        manager_id: manager.id,
        service_id: service_id,
        status_id: 3,
        date: currentDate,
        time: currentTime,
        center_id: manager.center_id
      })

      if (!reception) {
        throw new InternalServerErrorException('Не удалось создать запись')
      }

      return reception
    } catch (error) {
      throw new InternalServerErrorException('Не удалось создать запись')
    }
  }

  async getAllByManagerId(manager_id: number) {
    try {
      const managerReceptions = await this.receptionRepository.findAll({
        attributes: ['id', 'date', 'time', 'rating'],
        where: {
          manager_id
        },
        order: [
          ['date', 'DESC'],
          ['time', 'DESC']
        ],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id'],
            required: true,
            include: [
              {
                model: Profile,
                attributes: ['iin', 'full_name', 'phone']
              }
            ]
          },
          {
            model: Status,
            attributes: ['name']
          }
        ]
      })

      if (!managerReceptions.length) {
        return []
      }

      return managerReceptions
    } catch (error) {
      this.logger.error(`Ошибка при выборе записей менеджера: ${error}`)
      throw new InternalServerErrorException(
        'Ошибка при выборе записей менеджера'
      )
    }
  }
}
