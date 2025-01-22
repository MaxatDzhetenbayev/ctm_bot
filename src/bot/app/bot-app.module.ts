import { Module } from "@nestjs/common";
import { BotAppService } from "./bot-app.service";
import { BotAppController } from "./bot-app.controller";

@Module({
  providers: [BotAppService, BotAppController],
})
export class BotAppModule {}
