import { Context } from 'vm'
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf'

import { UsersService } from 'src/general/users/users.service'
import { BotCentersService } from '../bot_centers/bot_centers.service'
import { BotAuthService } from '../bot_auth/bot_auth.service'
import { BotLanguageService } from '../bot_language/bot_language.service'

@Update()
export class BotAppController {
  constructor(
    private readonly userService: UsersService,
    private readonly botAuthService: BotAuthService,
    private readonly botCenterService: BotCentersService,
    private readonly botLanguageService: BotLanguageService
  ) {}

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
    await ctx.deleteMessage()

    const chatId = String(ctx.chat?.id)
    const user = await this.userService.validateUserByTelegram(chatId)

    if (!user) {
      await this.botAuthService.promptRegistration(ctx, language)
    } else {
      await this.botCenterService.showCenters(ctx, language)
    }
  }
}
