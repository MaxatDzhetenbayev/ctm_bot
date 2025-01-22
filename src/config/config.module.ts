import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
    ConfigModule.forRoot({
      isGlobal: true, // Доступен во всех модулях без повторного импорта
      envFilePath: [".env"], // Укажите путь к вашему .env
      validationSchema: Joi.object({
        BOT_TOKEN: Joi.string().required(),
        NODE_ENV: Joi.string()
          .valid("development", "production", "test")
          .default("development"),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
export class AppConfigModule {}
