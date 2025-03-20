import { Injectable } from '@nestjs/common'
import { Context } from 'vm'

@Injectable()
export class BotLanguageService {
  async showLangKeyboard(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }

    const keyboardLang = [
      [
        { text: 'Русский', callback_data: 'set_language_ru' },
        { text: 'Қазақша', callback_data: 'set_language_kz' }
      ]
    ]

    await ctx.reply('Выберите язык', {
      reply_markup: { inline_keyboard: keyboardLang }
    })
  }

  async setLanguage(ctx: Context): Promise<string> {
    const language = ctx.match[1]
    ctx.session.language = language

    return language
  }
}
