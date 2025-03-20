import { Module } from '@nestjs/common'
import { BotLanguageService } from './bot_language.service'
import { CentersModule } from 'src/general/centers/centers.module'

@Module({
  providers: [BotLanguageService],
  imports: [CentersModule],
  exports: [BotLanguageService]
})
export class BotLanguageModule {}
