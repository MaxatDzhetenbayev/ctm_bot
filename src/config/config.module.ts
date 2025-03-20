import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { SequelizeModule } from '@nestjs/sequelize'
import * as Joi from 'joi'
import { TelegrafModule } from 'nestjs-telegraf'
import { Center } from 'src/general/centers/entities/center.entity'
import { UsersCenter } from 'src/general/centers/entities/users_center.entity'
import { Reception } from 'src/general/receptions/entities/reception.entity'
import { ManagerServices } from 'src/general/services/entities/manager-services.entity'
import { ServiceVisitorType } from 'src/general/services/entities/service-visitor.entity'
import { Service } from 'src/general/services/entities/service.entity'
import { ManagerTable } from 'src/general/users/entities/manager-table.entity'
import { Profile } from 'src/general/users/entities/profile.entity'
import { Role } from 'src/general/users/entities/role.entity'
import { User } from 'src/general/users/entities/user.entity'
import { VisitorTypesTable } from 'src/general/users/entities/visitor_types.entity'
import { Status } from 'src/status/entities/status.entity'
import * as LocalSession from 'telegraf-session-local'

const sessions = new LocalSession({ database: 'session_db.json' })

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        middlewares: [sessions.middleware()],
        token: configService.get<string>('BOT_TOKEN')
      })
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        logging: false,
        timezone: '+5:00',
        models: [
          User,
          Role,
          Profile,
          Center,
          UsersCenter,
          Service,
          ManagerServices,
          Reception,
          ManagerTable,
          Status,
          VisitorTypesTable,
          ServiceVisitorType
        ]
      })
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Доступен во всех модулях без повторного импорта
      envFilePath: ['.env'], // Укажите путь к вашему .env
      validationSchema: Joi.object({
        BOT_TOKEN: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required()
      })
    })
  ],
  exports: [SequelizeModule]
})
export class AppConfigModule {}
