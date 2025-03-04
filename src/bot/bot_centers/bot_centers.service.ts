import { Injectable } from '@nestjs/common'
import { CentersService } from 'src/general/centers/centers.service'
import { Context } from 'vm'

@Injectable()
export class BotCentersService {
  constructor(private readonly centerService: CentersService) {}

  async showCenters(ctx: Context, language: string) {
    const centers = await this.centerService.findAll()
    const keyboardCenters = centers.map(center => [
      { text: center.name[language], callback_data: `services_${center.id}` }
    ])

    const message = {
      ru: 'Выберите центр',
      kz: 'Кызмет орталығын таңданыз'
    }

    await ctx.reply(`${message[language]}`, {
      reply_markup: { inline_keyboard: keyboardCenters }
    })
  }
}
