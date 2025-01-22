import { Context } from "vm";
import { BotAppService } from "./bot-app.service";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { UsersService } from "src/default/users/users.service";
import { AuthType } from "src/default/users/entities/user.entity";

interface RegistrationContext extends Context {
  session: {
    registrationStep?: string;
    fullName?: string;
    iin?: string;
    phone?: string;
  };
}

@Update()
export class BotAppController {
  constructor(
    private readonly appService: BotAppService,
    private readonly userService: UsersService
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const keyboard = [[{ text: "Тіркелу", callback_data: "zapis" }]];

    await ctx.reply(
      "Сәлеметсіз бе! Қызметті таңдау үшін, астыдағы батырманы басыңыз",
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
  }

  @Action("zapis")
  async onZapis(@Ctx() ctx: Context) {
    await ctx.deleteMessage();

    const chatId = ctx.chat?.id;

    const user = await this.userService.validateUser(String(chatId));

    if (!user) {
      ctx.session.registrationStep = "fullName";
      await ctx.reply("Введите ваше ФИО");
      return;
    }

    await ctx.reply("Дальше");
  }

  @On("text")
  async onText(@Ctx() ctx: RegistrationContext) {
    const { registrationStep } = ctx.session;

    if (registrationStep === "fullName") {
      ctx.session.fullName = ctx.message.text;
      ctx.session.registrationStep = "iin";
      await ctx.reply("Введите ваш ИИН");
      return;
    }

    if (registrationStep === "iin") {
      ctx.session.iin = ctx.message.text;
      ctx.session.registrationStep = "phone";
      await ctx.reply("Введите ваш номер телефона");
      return;
    }

    if (registrationStep === "phone") {
      ctx.session.phone = ctx.message.text;
      ctx.session.registrationStep = undefined;

      const { fullName, iin, phone } = ctx.session;
      console.log({ fullName, iin, phone });

      await this.userService.createUser({
        full_name: fullName,
        iin,
        phone,
        telegram_id: ctx.chat?.id,
        auth_type: AuthType.telegram,
      });
      return;
    }

    await ctx.reply(
      "Пожалуйста, используйте команду /start или нажмите кнопку, чтобы начать."
    );
  }
}
