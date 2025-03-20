import { Module } from '@nestjs/common'
import { UsersModule } from 'src/general/users/users.module'
import { BotCentersModule } from '../bot_centers/bot_centers.module'
import { BotAuthController } from './bot-auth.controller'
import { BotAuthService } from './bot_auth.service'

@Module({
  imports: [UsersModule, BotCentersModule],
  providers: [BotAuthService, BotAuthController],
  exports: [BotAuthService]
})
export class BotAuthModule {}
