import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { BotAppModule } from "./bot/app/bot-app.module";
import { AuthModule } from "./default/auth/auth.module";
import { UsersModule } from './default/users/users.module';
import { CentersModule } from './manage/centers/centers.module';

@Module({
  imports: [AppConfigModule, BotAppModule, AuthModule, UsersModule, CentersModule],
})
export class AppModule {}
