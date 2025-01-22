import { Module } from "@nestjs/common";
import { BotAppService } from "./bot-app.service";
import { BotAppController } from "./bot-app.controller";
import { UsersModule } from "src/default/users/users.module";

@Module({
  providers: [BotAppService, BotAppController],
  imports: [UsersModule],
})
export class BotAppModule {}
