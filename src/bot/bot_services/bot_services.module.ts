import { Module } from "@nestjs/common";
import { BotServicesService } from "./bot_services.service";
import { BotServicesController } from "./bot_services.controller";
import { ServicesModule } from "src/manage/services/services.module";

@Module({
  imports: [ServicesModule],
  providers: [BotServicesService, BotServicesController],
})
export class BotServicesModule {}
