import { Injectable } from '@nestjs/common'
import { Context } from 'vm'
import { validateOrReject } from 'class-validator'
import { RegistrationContext } from './bot-auth.controller'
import { plainToInstance } from 'class-transformer'
import { RegistrationDto } from './dto/registration.dto'

@Injectable()
export class BotAuthService {
  async handleRegistrationStep(
    ctx: RegistrationContext
  ): Promise<string | null> {
    const { registrationStep } = ctx.session
    const input = ctx.message.text.trim()
    const dto = plainToInstance(RegistrationDto, { [registrationStep]: input })

    try {
      await validateOrReject(dto)
      ctx.session[registrationStep] = input

      if (registrationStep === 'full_name') return 'iin'
      if (registrationStep === 'iin') return 'phone'
      if (registrationStep === 'phone') return 'visitor_type'
      return null
    } catch (error) {
      await ctx.reply(this.getValidationError(registrationStep))
      return registrationStep
    }
  }

  async promptRegistration(ctx: Context, language: string) {
    const reply = {
      registration_button: {
        kz: 'Тіркелу',
        ru: 'Регистрация'
      },
      info: {
        kz: 'Қызметті таңдау үшін, астыдағы батырманы басыңыз',
        ru: 'Для выбора услуги нажмите на кнопку ниже'
      }
    }

    const keyboardNext = [
      [
        {
          text: reply.registration_button[language],
          callback_data: 'registration'
        }
      ]
    ]

    await ctx.reply(reply.info[language], {
      reply_markup: { inline_keyboard: keyboardNext }
    })
  }

  getStepPrompt(step: string, language: string): string {
    const prompts = {
      full_name: {
        kz: 'Т.А.Ә енгізіңіз',
        ru: 'Введите ваше ФИО'
      },
      iin: {
        kz: 'ЖСН енгізіңіз',
        ru: 'Введите ваш ИИН'
      },
      phone: {
        kz: 'Телефон нөміріңізді енгізіңіз',
        ru: 'Введите ваш номер телефона'
      },
      visitor_type: {
        kz: 'Егер сіз жұмыс беруші болсаңыз, 1 енгізіңіз, егер өтініш беруші болсаңыз, 2 енгізіңіз',
        ru: 'Если вы работодатель, введите 1, если соискатель, введите 2'
      }
    }

    return prompts[step]?.[language] || 'Введите данные'
  }

  private getValidationError(step: string): string {
    const errors = {
      full_name: 'ФИО должно быть строкой не менее 6 символов',
      iin: 'ИИН должен быть строкой из 12 символов',
      phone: 'Номер телефона должен быть валидным',
      visitor_type: 'Число должно быть 1 или 2'
    }

    return errors[step] || 'Некорректные данные'
  }
}
