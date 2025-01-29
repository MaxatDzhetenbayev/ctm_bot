import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { BotAppModule } from "./bot/app/bot-app.module";
import { AuthModule } from "./default/auth/auth.module";
import { UsersModule } from "./default/users/users.module";
import { CentersModule } from "./manage/centers/centers.module";
import { ServicesModule } from "./manage/services/services.module";
import { BotCentersModule } from "./bot/bot_centers/bot_centers.module";
import { BotAuthModule } from "./bot/bot_auth/bot_auth.module";
import { BotServicesModule } from "./bot/bot_services/bot_services.module";
import { ReceptionsModule } from "./manage/receptions/receptions.module";
import { NotificationsModule } from "./default/notifications/notifications.module";

@Module({
  imports: [
    AppConfigModule,
    BotAppModule,
    AuthModule,
    UsersModule,
    CentersModule,
    ServicesModule,
    BotCentersModule,
    BotAuthModule,
    BotServicesModule,
    ReceptionsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
