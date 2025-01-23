import { Injectable } from "@nestjs/common";
import { Context } from "vm";
import { validateOrReject } from "class-validator";
import { RegistrationContext } from "./bot-auth.controller";
import { plainToInstance } from "class-transformer";
import { RegistrationDto } from "./dto/registration.dto";

@Injectable()
export class BotAuthService {
  async handleRegistrationStep(
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

  async promptRegistration(ctx: Context, language: string) {
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

  getStepPrompt(step: string, language: string): string {
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
