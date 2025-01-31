import { Context } from "vm";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";

import { UsersService } from "src/general/users/users.service";
import { BotCentersService } from "../bot_centers/bot_centers.service";
import { BotAuthService } from "../bot_auth/bot_auth.service";

import { AuthType } from "src/general/users/entities/user.entity";
import { RegistrationContext } from "../bot_auth/bot-auth.controller";

@Update()
export class BotAppController {
  constructor(
    private readonly userService: UsersService,
    private readonly botAuthService: BotAuthService,
    private readonly botCenterService: BotCentersService
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const keyboardLang = [
      [
        { text: "Русский", callback_data: "set_language_ru" },
        { text: "Қазақша", callback_data: "set_language_kz" },
      ],
    ];

    await ctx.reply("Сәлеметсіз бе! Ең алдымен тілді таңдаңыз", {
      reply_markup: { inline_keyboard: keyboardLang },
    });
  }

  @Action(/set_language_(.+)/)
  async setLanguage(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const language = ctx.match[1];
    ctx.session.language = language;

    const chatId = String(ctx.chat?.id);
    const user = await this.userService.validateUserByTelegram(chatId);

    if (!user) {
      await this.botAuthService.promptRegistration(ctx, language);
    } else {
      await this.botCenterService.showCenters(ctx, language);
    }
  }

  @Action("registration")
  async onRegistration(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const language = ctx.session.language;

    ctx.session.registrationStep = "full_name";
    await ctx.reply(this.botAuthService.getStepPrompt("full_name", language));
  }

  @On("text")
  async onText(@Ctx() ctx: RegistrationContext) {
    const { registrationStep } = ctx.session;
    if (!registrationStep) return;

    const nextStep = await this.botAuthService.handleRegistrationStep(ctx);
    if (nextStep) {
      ctx.session.registrationStep = nextStep;
      await ctx.reply(
        this.botAuthService.getStepPrompt(nextStep, ctx.session.language)
      );
    } else {
      ctx.session.registrationStep = undefined;
      const { full_name, iin, phone } = ctx.session;

      await this.userService.createUserByTelegram({
        full_name,
        iin,
        phone,
        telegram_id: ctx.chat?.id,
        auth_type: AuthType.telegram,
      });

      await this.botCenterService.showCenters(ctx, ctx.session.language);
    }
  }
}
