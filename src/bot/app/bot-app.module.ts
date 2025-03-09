import { Module } from '@nestjs/common'
import { BotAppController } from './bot-app.controller'
import { UsersModule } from 'src/general/users/users.module'
import { BotCentersModule } from '../bot_centers/bot_centers.module'
import { BotAuthModule } from '../bot_auth/bot_auth.module'
import { BotLanguageModule } from '../bot_language/bot_language.module'
import { ReceptionsModule } from 'src/general/receptions/receptions.module'

@Module({
  providers: [BotAppController],
  imports: [
    UsersModule,
    BotCentersModule,
    BotAuthModule,
    BotLanguageModule,
    ReceptionsModule
  ]
})
export class BotAppModule {}
