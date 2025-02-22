import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { Center } from '../centers/entities/center.entity'
import { CreateUserByTelegramDto } from './dto/create-user-by-telegram.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ManagerTable } from './entities/manager-table.entity'
import { Profile } from './entities/profile.entity'
import { Role } from './entities/role.entity'
import { AuthType, User } from './entities/user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly usersRepository: typeof User,
    @InjectModel(Profile)
    private readonly profilesRepository: typeof Profile,
    @InjectModel(ManagerTable)
    private readonly managerTableRepository: typeof ManagerTable,
    private readonly sequelize: Sequelize
  ) {}

  private readonly logger = new Logger(this.usersRepository.name)

  async createUser(dto: CreateUserDto) {
    const transaction = await this.sequelize.transaction()

    if ((dto.role === 1)) {
      throw new BadRequestException('У вас нет прав на создание данной роли')
    }

    try {
      const { login, password, role, profile, center_id, service_ids } = dto

      const findUserInCenter = await this.usersRepository.findOne({
        where: {
          login
        },
        include: [
          {
            model: Center,
            where: {
              id: center_id
            },
            attributes: [],
            through: { attributes: [] }
          }
        ]
      })

      if (findUserInCenter) {
        throw new ConflictException(
          'Пользователь с таким логином уже существует в данном центре'
        )
      }

      const user = await this.usersRepository.create(
        {
          login,
          password_hash: password,
          role_id: role,
          auth_type: AuthType.default
        },
        {
          transaction
        }
      )

      if (!user) {
        throw new InternalServerErrorException(
          'Ошибка при создании пользователя'
        )
      }

      const userProfile = await user.$create('profile', profile, {
        transaction
      })

      if (!userProfile) {
        throw new InternalServerErrorException(
          'Ошибка при создании профиля пользователя'
        )
      }

      await user.$add('centers', center_id, { transaction })

      if (service_ids) {
        await user.$add('services', service_ids, { transaction })
      }

      await transaction.commit()

      const { password_hash, ...user_data } = user.toJSON()

      return user_data
    } catch (error) {
      await transaction.rollback()

      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при создании пользователя')
    }
  }

  async getManager(managerId: number) {
    try {
      const manager = await this.usersRepository.findOne({
        where: {
          id: managerId
        },
        include: [
          {
            model: Role,
            where: { name: 'manager' },
            attributes: ['name']
          },
          {
            model: Profile,
            attributes: ['full_name', 'iin', 'phone']
          }
        ]
      })

      if (!manager) {
        throw new NotFoundException('Менеджер не найден')
      }

      if (manager.role.name !== 'manager') {
        throw new BadRequestException('Пользователь не является менеджером')
      }

      return manager
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при получении менеджера')
    }
  }

  async getProfileUser({ login }: { login: string }) {
    try {
      const user = await this.validateUserByLogin(login)
      if (!user) {
        throw new NotFoundException('Пользователь не найден')
      }

      const profile = await this.profilesRepository.findOne({
        where: {
          id: user.id
        }
      })

      if (!profile) {
        throw new NotFoundException('Профиль пользователя не найден')
      }

      const { login: userLogin, role } = user
      const { full_name } = profile

      return {
        userLogin,
        role: role.name,
        full_name
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException(
        'Ошибка при получении профиля пользователя'
      )
    }
  }

  async validateUserByLogin(login: string) {
    const user = await this.usersRepository.findOne({
      where: {
        login: login
      },
      include: [
        {
          model: Role,
          attributes: ['name']
        },
        {
          model: Center,
          through: { attributes: [] }
        }
      ],
      plain: true
    })

    return user
  }

  async createUserByTelegram(dto: CreateUserByTelegramDto) {
    this.logger.log('Создание пользователя')
    try {
      const transaction = await this.sequelize.transaction()

      const { role, full_name, iin, phone, ...userData } = dto

      const user = await this.usersRepository.create(userData, {
        transaction
      })

      if (!user) {
        this.logger.error('Ошибка при создании пользователя')
        throw new InternalServerErrorException(
          'Ошибка при создании пользователя'
        )
      }

      const profile = await this.profilesRepository.create(
        {
          id: user.id,
          iin,
          full_name,
          phone
        },
        { transaction }
      )

      if (!profile) {
        this.logger.error('Ошибка при создании профиля пользователя')
        throw new InternalServerErrorException(
          'Ошибка при создании профиля пользователя'
        )
      }

      await user.$set('role', role, { transaction })

      await transaction.commit()

      const result = {
        user: user.toJSON(),
        profile: profile.toJSON()
      }

      return result
    } catch (error) {
      this.logger.error('Ошибка при создании пользователя. Ошибка: ' + error)
      throw new InternalServerErrorException('Ошибка при создании пользователя')
    }
  }

  async validateUserByTelegram(telegram_id: string) {
    this.logger.log('Проверка пользователя')
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id
      }
    })

    return user
  }

  async getManagersByCenter(center_id: number) {
    try {
      const managers = await this.managerTableRepository.findAll({
        where: { center_id },
        attributes: ['manager_id']
      })

      if (!managers.length) {
        throw new NotFoundException('Менеджеры не найдены')
      }

      const managerIds = managers.map(manager => manager.manager_id)

      const profiles = await this.profilesRepository.findAll({
        where: { id: managerIds },
        attributes: ['id', 'full_name', 'iin', 'phone']
      })

      if (!profiles.length) {
        return []
      }

      return profiles
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('Ошибка при получении менеджеров')
    }
  }

  async getEmployeeByFullName(full_name: string, user: User) {
    function capitalizeFullName(name: string): string {
      return name
        .toLowerCase()
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    try {
      const userWithCenters = await this.usersRepository.findOne({
        where: { id: user.id },
        include: [{ model: Center, through: { attributes: [] } }]
      })

      if (!userWithCenters || !userWithCenters.centers.length) {
        throw new BadRequestException('У пользователя не найден центр')
      }

      console.log('📌 У пользователя центры:', userWithCenters.centers)

      const centerId = userWithCenters.centers[0].id
      console.log('📌 Поиск в центре:', centerId)

      const decodedFullName = decodeURIComponent(full_name).trim()
      console.log('🔍 Ищу сотрудника с ФИО:', decodedFullName)

      const formattedFullName = capitalizeFullName(decodedFullName)
      console.log('🔍 Отформатированное ФИО:', formattedFullName)

      const profiles = await this.profilesRepository.findAll({
        where: {
          full_name: { [Op.iLike]: `%${formattedFullName}%` }
        },
        include: [
          {
            model: User,
            include: [
              {
                model: Center,
                through: { attributes: [] },
                where: { id: centerId }
              }
            ]
          }
        ],
        attributes: ['id', 'full_name', 'iin', 'phone']
      })

      console.log('📌 Найденные сотрудники в центре:', profiles)

      if (!profiles.length) {
        throw new NotFoundException(
          'Сотрудник с таким ФИО не найден в этом центре'
        )
      }

      const managerIds = profiles.map(profile => profile.id)
      const managerEntries = await this.managerTableRepository.findAll({
        where: { manager_id: managerIds }
      })

      console.log('📌 Найденные менеджеры в центре:', managerEntries)

      if (!managerEntries.length) {
        throw new NotFoundException(
          'Этот сотрудник не является менеджером в данном центре'
        )
      }

      const managerProfiles = profiles.filter(profile =>
        managerEntries.some(manager => manager.manager_id === profile.id)
      )

      console.log('📌 Итоговый список менеджеров:', managerProfiles)

      return managerProfiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        iin: profile.iin,
        phone: profile.phone
      }))
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('Ошибка при поиске менеджера')
    }
  }

  async updateEmployeeById(
    employeeId: number,
    updateData: { full_name?: string; iin?: string; phone?: string },
    user: User
  ) {
    try {
      const userWithCenters = await this.usersRepository.findOne({
        where: { id: user.id },
        include: [{ model: Center, through: { attributes: [] } }]
      })

      if (!userWithCenters || !userWithCenters.centers.length) {
        throw new BadRequestException('У вас нет привязанного центра')
      }

      console.log('📌 Центры пользователя:', userWithCenters.centers)

      const centerId = userWithCenters.centers[0].id
      console.log('📌 Работаем с центром:', centerId)

      const profile = await this.profilesRepository.findOne({
        where: { id: employeeId },
        include: [
          {
            model: User,
            include: [
              {
                model: Center,
                through: { attributes: [] },
                where: { id: centerId }
              }
            ]
          }
        ]
      })

      if (!profile) {
        throw new NotFoundException(
          'Работник не найден или не относится к вашему центру'
        )
      }

      console.log('📌 Найденный работник:', profile)

      await profile.update({
        full_name: updateData.full_name ?? profile.full_name,
        iin: updateData.iin ?? profile.iin,
        phone: updateData.phone ?? profile.phone
      })

      console.log('📌 Обновленный профиль:', profile)

      return profile
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении информации о работнике'
      )
    }
  }

  async createManager(dto: CreateUserDto, user: User) {
    const transaction = await this.sequelize.transaction()

    try {
      let centerId = dto.center_id
      if (!centerId) {
        const userWithCenters = await this.usersRepository.findOne({
          where: { id: user.id },
          include: [{ model: Center, through: { attributes: [] } }]
        })

        if (!userWithCenters || !userWithCenters.centers.length) {
          throw new BadRequestException(
            'У вас нет привязанного центра, и он не указан в запросе'
          )
        }

        centerId = userWithCenters.centers[0].id
      }

      console.log('📌 Центр для работника:', centerId)

      const findUserInCenter = await this.usersRepository.findOne({
        where: { login: dto.login },
        include: [
          {
            model: Center,
            where: { id: centerId },
            attributes: [],
            through: { attributes: [] }
          }
        ]
      })

      if (findUserInCenter) {
        throw new ConflictException(
          'Пользователь с таким логином уже существует в данном центре'
        )
      }

      const newUser = await this.usersRepository.create(
        {
          login: dto.login,
          password_hash: dto.password,
          role_id: dto.role ?? 2,
          auth_type: AuthType.default
        },
        { transaction }
      )

      if (!newUser) {
        throw new InternalServerErrorException(
          'Ошибка при создании пользователя'
        )
      }

      console.log('📌 Создан пользователь:', newUser)

      const userProfile = await newUser.$create('profile', dto.profile, {
        transaction
      })

      await this.managerTableRepository.create(
        {
          manager_id: newUser.id,
          center_id: centerId,
          table: dto.table
        },
        { transaction }
      )

      if (!userProfile) {
        throw new InternalServerErrorException(
          'Ошибка при создании профиля пользователя'
        )
      }

      console.log('📌 Создан профиль работника:', userProfile)

      await newUser.$add('centers', centerId, { transaction })

      if (dto.service_ids) {
        await newUser.$add('services', dto.service_ids, { transaction })
      }

      await transaction.commit()

      const { password_hash, ...user_data } = newUser.toJSON()
      return user_data
    } catch (error) {
      await transaction.rollback()
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('Ошибка при создании работника')
    }
  }
}
