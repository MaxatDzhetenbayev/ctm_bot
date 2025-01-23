import { Context } from "vm";
import { Action, Ctx, On, Start, Update } from "nestjs-telegraf";
import { UsersService } from "src/default/users/users.service";
import { AuthType } from "src/default/users/entities/user.entity";
import { CentersService } from "src/manage/centers/centers.service";
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  validateOrReject,
} from "class-validator";
import { plainToInstance } from "class-transformer";

interface RegistrationContext extends Context {
  session: {
    registrationStep?: string;
    full_name?: string;
    iin?: string;
    phone?: string;
    language: string;
  };
}

class RegistrationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(12)
  iin?: string;

  @IsOptional()
  @IsPhoneNumber("KZ")
  phone?: string;
}

@Update()
export class BotAppController {
  constructor(
    private readonly userService: UsersService,
    private readonly centerService: CentersService
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
    const user = await this.userService.validateUser(chatId);

    if (!user) {
      await this.promptRegistration(ctx, language);
    } else {
      await this.showCenters(ctx, language);
    }
  }

  @Action("registration")
  async onRegistration(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    ctx.session.registrationStep = "full_name";
    await ctx.reply("Введите ваше ФИО");
  }

  @On("text")
  async onText(@Ctx() ctx: RegistrationContext) {
    const { registrationStep } = ctx.session;
    if (!registrationStep) return;

    const nextStep = await this.handleRegistrationStep(ctx);
    if (nextStep) {
      ctx.session.registrationStep = nextStep;
      await ctx.reply(this.getStepPrompt(nextStep, ctx.session.language));
    } else {
      ctx.session.registrationStep = undefined;
      const { full_name, iin, phone } = ctx.session;

      await this.userService.createUser({
        full_name,
        iin,
        phone,
        telegram_id: ctx.chat?.id,
        auth_type: AuthType.telegram,
      });

      await this.showCenters(ctx, ctx.session.language);
    }
  }

  private async handleRegistrationStep(
    ctx: RegistrationContext
  ): Promise<string | null> {
    const { registrationStep } = ctx.session;
    const input = ctx.message.text.trim();
    const dto = plainToInstance(RegistrationDto, { [registrationStep]: input });

    try {
      await validateOrReject(dto);
      ctx.session[registrationStep] = input;

      if (registrationStep === "full_name") return "iin";
      if (registrationStep === "iin") return "phone";
      return null;
    } catch (error) {
      await ctx.reply(this.getValidationError(registrationStep));
      return registrationStep;
    }
  }

  private async showCenters(ctx: Context, language: string) {
    const centers = await this.centerService.findAll();
    const keyboardCenters = centers.map((center) => [
      { text: center.name[language], callback_data: `center_${center.id}` },
    ]);

    await ctx.reply("Выберите центр", {
      reply_markup: { inline_keyboard: keyboardCenters },
    });
  }

  private async promptRegistration(ctx: Context, language: string) {
    const reply = {
      registration_button: {
        kz: "Тіркелу",
        ru: "Регистрация",
      },
      info: {
        kz: "Қызметті таңдау үшін, астыдағы батырманы басыңыз",
        ru: "Для выбора услуги нажмите на кнопку ниже",
      },
    };

    const keyboardNext = [
      [
        {
          text: reply.registration_button[language],
          callback_data: "registration",
        },
      ],
    ];

    await ctx.reply(reply.info[language], {
      reply_markup: { inline_keyboard: keyboardNext },
    });
  }

  private getStepPrompt(step: string, language: string): string {
    const prompts = {
      full_name: {
        kz: "ФИО енгізіңіз",
        ru: "Введите ваше ФИО",
      },
      iin: {
        kz: "ИИН енгізіңіз",
        ru: "Введите ваш ИИН",
      },
      phone: {
        kz: "Телефон нөміріңізді енгізіңіз",
        ru: "Введите ваш номер телефона",
      },
    };

    return prompts[step]?.[language] || "Введите данные";
  }

  private getValidationError(step: string): string {
    const errors = {
      full_name: "ФИО должно быть строкой не менее 6 символов",
      iin: "ИИН должен быть строкой из 12 символов",
      phone: "Номер телефона должен быть валидным",
    };

    return errors[step] || "Некорректные данные";
  }
}
