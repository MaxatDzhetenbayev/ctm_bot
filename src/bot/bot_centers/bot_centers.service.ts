import { Injectable } from '@nestjs/common'
import { message } from 'src/config/translations'
import { CentersService } from 'src/general/centers/centers.service'
import { Context } from 'vm'

@Injectable()
export class BotCentersService {
  constructor(private readonly centerService: CentersService) {}

  async showCenters(ctx: Context, language: string) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const centers = await this.centerService.findAll()
    const keyboardCenters = centers.map(center => [
      { text: center.name[language], callback_data: `services_${center.id}` }
    ])

    await ctx.reply(`${message[language].choice_center}`, {
      reply_markup: { inline_keyboard: keyboardCenters }
    })
  }
}
