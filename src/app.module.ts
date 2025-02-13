import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppConfigModule } from "./config/config.module";
import { BotAppModule } from "./bot/app/bot-app.module";
import { AuthModule } from "./general/auth/auth.module";
import { UsersModule } from "./general/users/users.module";
import { CentersModule } from "./general/centers/centers.module";
import { ServicesModule } from "./general/services/services.module";
import { BotCentersModule } from "./bot/bot_centers/bot_centers.module";
import { BotAuthModule } from "./bot/bot_auth/bot_auth.module";
import { BotServicesModule } from "./bot/bot_services/bot_services.module";
import { ReceptionsModule } from "./general/receptions/receptions.module";
import { NotificationsModule } from "./general/notifications/notifications.module";
import { AuthMiddleware } from "./general/auth/auth.middleware";
import { JwtConfigModule } from "./config/jwt-config.module";
import { StatusModule } from './status/status.module';

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
    JwtConfigModule,
    StatusModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: "auth/(.*)", method: RequestMethod.ALL })
      .forRoutes("*");
  }
}
