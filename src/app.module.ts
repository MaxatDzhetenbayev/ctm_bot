import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { BotAppModule } from "./bot/app/bot-app.module";
import { AuthModule } from "./default/auth/auth.module";
import { UsersModule } from './default/users/users.module';
import { CentersModule } from './manage/centers/centers.module';
import { ServicesModule } from './manage/services/services.module';

@Module({
  imports: [AppConfigModule, BotAppModule, AuthModule, UsersModule, CentersModule, ServicesModule],
})
export class AppModule {}
