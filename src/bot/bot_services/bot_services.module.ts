import { Module } from "@nestjs/common";
import { BotServicesService } from "./bot_services.service";
import { BotServicesController } from "./bot_services.controller";
import { ServicesModule } from "src/manage/services/services.module";
import { ReceptionsModule } from "src/manage/receptions/receptions.module";
import { UsersModule } from "src/default/users/users.module";

@Module({
  imports: [ServicesModule, ReceptionsModule, UsersModule],
  providers: [BotServicesService, BotServicesController],
})
export class BotServicesModule {}
