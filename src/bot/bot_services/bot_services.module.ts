import { Module } from "@nestjs/common";
import { BotServicesService } from "./bot_services.service";
import { BotServicesController } from "./bot_services.controller";
import { ServicesModule } from "src/general/services/services.module";
import { ReceptionsModule } from "src/general/receptions/receptions.module";
import { UsersModule } from "src/general/users/users.module";

@Module({
  imports: [ServicesModule, ReceptionsModule, UsersModule],
  providers: [BotServicesService, BotServicesController],
})
export class BotServicesModule {}
