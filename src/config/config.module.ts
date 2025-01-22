import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import * as Joi from "joi";
import { TelegrafModule } from "nestjs-telegraf";
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
        autoLoadModels: true,
        logging: false,
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
