import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { BotAppModule } from "./bot/app/bot-app.module";
import { AuthModule } from './manage/auth/auth.module';
import { UsersModule } from './manage/users/users.module';

@Module({
  imports: [AppConfigModule, BotAppModule, AuthModule, UsersModule],
})
export class AppModule {}
