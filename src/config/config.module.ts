import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import * as Joi from "joi";
import { TelegrafModule } from "nestjs-telegraf";
import { Profile } from "src/default/users/entities/profile.entity";
import { Role } from "src/default/users/entities/role.entity";
import { User } from "src/default/users/entities/user.entity";
import { Center } from "src/manage/centers/entities/center.entity";
import { UsersCenter } from "src/manage/centers/entities/users_center.entity";
import { Reception } from "src/manage/receptions/entities/reception.entity";
import { ReceptionStatus } from "src/manage/receptions/entities/reception_status.entity";
import { ManagerServices } from "src/manage/services/entities/manager-services.entity";
import { Service } from "src/manage/services/entities/service.entity";
import * as LocalSession from "telegraf-session-local";

const sessions = new LocalSession({ database: "session_db.json" });

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        middlewares: [sessions.middleware()],
        token: configService.get<string>("BOT_TOKEN"),
      }),
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: "postgres",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USER"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        logging: true,
        timezone: "+5:00",
        models: [
          User,
          Role,
          Profile,
          Center,
          UsersCenter,
          Service,
          ManagerServices,
          Reception,
          ReceptionStatus,
        ],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Доступен во всех модулях без повторного импорта
      envFilePath: [".env"], // Укажите путь к вашему .env
      validationSchema: Joi.object({
        BOT_TOKEN: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
  ],
  exports: [SequelizeModule],
})
export class AppConfigModule {}
