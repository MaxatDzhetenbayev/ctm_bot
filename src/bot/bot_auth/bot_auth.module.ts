import { Module } from "@nestjs/common";
import { BotAuthService } from "./bot_auth.service";

@Module({
  providers: [BotAuthService],
  exports: [BotAuthService],
})
export class BotAuthModule {}
