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
import { FindOptions, Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { Center } from '../centers/entities/center.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { ManagerTable } from './entities/manager-table.entity'
import { Profile } from './entities/profile.entity'
import { Role, RoleType } from './entities/role.entity'
import { AuthType, User } from './entities/user.entity'
import { GetManagersDto } from './dto/get-managers.dto'
import { UpdateManagerDto } from './dto/update-manager.dto'
import { Service } from '../services/entities/service.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly usersRepository: typeof User,
    @InjectModel(Profile)
    private readonly profilesRepository: typeof Profile,
    @InjectModel(Role)
    private readonly rolesRepository: typeof Role,
    @InjectModel(ManagerTable)
    private readonly managerTableRepository: typeof ManagerTable,
    private readonly sequelize: Sequelize
  ) {}

  private readonly logger = new Logger(this.usersRepository.name)

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

  async validateUserByTelegram(telegram_id: string) {
    this.logger.log('Проверка пользователя')
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id
      }
    })

    return user
  }

  async getManagersByCenter(center_id: number, query: GetManagersDto) {
    const { limit, page, search } = query
    const offset = (page - 1) * limit
    try {
      const options: FindOptions = {
        limit,
        offset,
        where: { role_id: 3 },
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
      }

      if (search) {
        options.include = [
          {
            model: Profile,
            where: {
              full_name: {
                [Op.iLike]: `%${search}%`
              }
            }
          }
        ]
      }

      const managers = await this.usersRepository.findAndCountAll(options)

      if (!managers.rows.length) {
        return []
      }

      const managerIds = managers.rows.map(manager => manager.id)

      const profiles = await this.profilesRepository.findAll({
        where: { id: managerIds },
        attributes: ['id', 'full_name', 'phone']
      })

      if (!profiles.length) {
        return []
      }

      return {
        managers: profiles,
        total: managers.count,
        page,
        totalPages: Math.ceil(managers.count / limit)
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException('Ошибка при получении менеджеров')
    }
  }

  async updateEmployeeById(
    employeeId: number,
    updateData: UpdateManagerDto,
    user: { id: number; login: string; role: string; center_id: number }
  ) {
    try {
      const manager = await this.usersRepository.findOne({
        where: { id: employeeId },
        attributes: {
          exclude: [
            'auth_type',
            'telegram_id',
            'password_hash',
            'role_id',
            'visitor_type_id'
          ]
        },
        include: [
          {
            model: Center,
            through: { attributes: [] },
            where: { id: user.center_id }
          },
          {
            model: Profile,
            as: 'profile'
          },
          {
            model: ManagerTable,
            as: 'manager_table'
          },
          {
            model: Service,
            as: 'services',
            through: {
              attributes: []
            }
          }
        ]
      })

      if (!manager) {
        throw new NotFoundException(
          'Работник не найден или не относится к вашему центру'
        )
      }
      const { profile, table, cabinet, service_ids, ...main } = updateData

      await manager.update(main)

      await manager.profile.update(profile)

      await manager.manager_table.update({
        table,
        cabinet
      })

      console.log(service_ids)
      if (service_ids) {
        await manager.$set('services', service_ids)
      }

      return manager
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      console.log(error)
      throw new InternalServerErrorException(
        'Ошибка при обновлении информации о работнике'
      )
    }
  }

  async createUser({
    dto,
    creater_role
  }: {
    dto: CreateUserDto
    auth_type?: AuthType
    creater_role?: RoleType
  }) {
    const ROLE_HIERARCHY = {
      [RoleType.superadmin]: [RoleType.admin],
      [RoleType.admin]: [RoleType.manager, RoleType.user],
      [RoleType.manager]: [RoleType.user],
      [RoleType.user]: []
    }

    const transaction = await this.sequelize.transaction()
    try {
      this.logger.log('Создание пользователя')
      const {
        login,
        password,
        profile,
        visitor_type,
        center_id,
        cabinet,
        role,
        service_ids,
        telegram_id,
        table,
        auth_type
      } = dto

      // const createrRole = await this.rolesRepository.findOne({
      //   where: { name: creater_role }
      // })

      // if (!createrRole) {
      //   throw new InternalServerErrorException('Роль создателя не найдена')
      // }

      // const AUTH_RESTRICTIONS = {
      //   [RoleType.manager]: AuthType.offline,
      //   [RoleType.user]: AuthType.telegram
      // }

      // if (
      //   AUTH_RESTRICTIONS[createrRole.name] &&
      //   auth_type !== AUTH_RESTRICTIONS[createrRole.name]
      // ) {
      //   throw new ForbiddenException(
      //     `У вас нет прав на создание пользователя с типом авторизации ${auth_type}`
      //   )
      // }

      // if (!ROLE_HIERARCHY[createrRole.name]?.includes(role)) {
      //   throw new ForbiddenException('У вас нет прав на создание данной роли')
      // }

      const userFindConfig: FindOptions = {}

      if (auth_type === AuthType.default) {
        userFindConfig.where = { login }
      } else {
        userFindConfig.include = [
          {
            model: Profile,
            where: { iin: profile.iin }
          }
        ]
      }

      const findedUser = await this.usersRepository.findOne(userFindConfig)

      if (findedUser) {
        throw new ConflictException('Такой пользователь уже существует')
      }

      const { id: role_id } = await this.rolesRepository.findOne({
        where: { name: role }
      })

      if (!role_id) {
        throw new BadRequestException('Роль не найдена')
      }

      const user = await this.usersRepository.create(
        {
          login,
          password_hash: password,
          role_id,
          telegram_id,
          auth_type,
          visitor_type_id: visitor_type
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

      if (role == RoleType.manager) {
        await this.managerTableRepository.create(
          {
            manager_id: user.id,
            center_id,
            table: table,
            cabinet: cabinet
          },
          { transaction }
        )

        if (service_ids) {
          await user.$add('services', service_ids, { transaction })
        }
      }

      await transaction.commit()

      return {
        message: 'Пользователь успешно создан',
        statusCode: 201
      }
    } catch (error) {
      await transaction.rollback()

      this.logger.error('Ошибка при создании пользователя. Ошибка: ' + error)

      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при создании пользователя')
    }
  }
}
