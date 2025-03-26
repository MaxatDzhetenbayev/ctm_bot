import { Context } from 'vm'
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf'

import { UsersService } from 'src/general/users/users.service'
import { BotCentersService } from '../bot_centers/bot_centers.service'
import { BotAuthService } from '../bot_auth/bot_auth.service'
import { BotLanguageService } from '../bot_language/bot_language.service'
import { ReceptionsService } from 'src/general/receptions/receptions.service'

@Update()
export class BotAppController {
  constructor(
    private readonly userService: UsersService,
    private readonly botAuthService: BotAuthService,
    private readonly botCenterService: BotCentersService,
    private readonly botLanguageService: BotLanguageService,
    private readonly receptionsService: ReceptionsService
  ) { }

  @Start()
  async onStart(@Ctx() ctx: Context) {
    if (ctx.session.language) {
      await this.processAfterLanguageSelection(ctx, ctx.session.language)
    } else {
      await this.botLanguageService.showLangKeyboard(ctx)
    }
  }

  @Command('service')
  async showCentersComand(@Ctx() ctx: Context) {
    await this.processAfterLanguageSelection(ctx, ctx.session.language)
  }
  @Command('receptions')
  async getMyReceptions(@Ctx() ctx: Context) {
    const chatId = String(ctx.chat?.id)
    const lang = ctx.session.language

    const receptions = await this.receptionsService.findByUserTelegramId(chatId)

    if (receptions.length === 0) {
      await ctx.reply('У вас пока нет записей')
    } else {
      for (const reception of receptions) {
        const { date, time, manager, status, service } = reception
        await ctx.reply(
          `Услуга: ${service.name[lang]}
					\nДата: ${date}
					\nВремя: ${time}
					\nСтатус: ${this.normalizeStatus(status.name)}
					\nМенеджер: ${manager.profile.full_name}
					`,
          {
            reply_markup:
              status.name === 'pending'
                ? {
                  inline_keyboard: [
                    [
                      {
                        text: 'Отменить',
                        callback_data: `cancel_${reception.id}`
                      }
                    ]
                  ]
                }
                : {}
          }
        )
      }
    }
  }

  @Command('language')
  async choiceLang(@Ctx() ctx: Context) {
    await this.botLanguageService.showLangKeyboard(ctx)
  }

  @Action(/set_language_(.+)/)
  async setLanguage(@Ctx() ctx: Context) {
    const language = await this.botLanguageService.setLanguage(ctx)
    await this.processAfterLanguageSelection(ctx, language)
  }

  async processAfterLanguageSelection(ctx: Context, language: string) {

    const chatId = String(ctx.chat?.id)
    const user = await this.userService.validateUserByTelegram(chatId)

    if (!user) {
      await this.botAuthService.promptRegistration(ctx, language)
    } else {
      await this.botCenterService.showCenters(ctx, language)
    }
  }

  private normalizeStatus(status?: string) {
    switch (status) {
      case 'pending':
        return 'На ожидании'
      case 'working':
        return 'В работе'
      case 'done':
        return 'Завершен'
      case 'canceled':
        return 'Отменен'
      default:
        return 'Ошибка'
    }
  }
}
