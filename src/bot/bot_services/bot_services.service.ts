import { Injectable } from '@nestjs/common'
import { ServicesService } from 'src/general/services/services.service'
import { Context } from 'vm'
import * as moment from 'moment'

@Injectable()
export class BotServicesService {
  constructor(private readonly servicesService: ServicesService) {}

  async showServices(ctx, centerId) {
    if (ctx.session.preAppointmentMessageId) {
      await ctx.deleteMessage(ctx.session.preAppointmentMessageId)
    }

    ctx.session.centerId = centerId
    const lang = ctx.session.language
    const services = await this.servicesService.findAll()

    const keyboardServices = services.map(service => [
      {
        text: service.name[ctx.session.language],
        callback_data: `service_${service.id}`
      }
    ])

    const message = {
      ru: 'Выберите услугу',
      kz: 'Қызметті таңдаңыз'
    }

    await ctx.reply(`${message[lang]}`, {
      reply_markup: { inline_keyboard: keyboardServices }
    })
  }

  async showService(ctx, serviceId) {
    const lang = ctx.session.language

    const service = await this.servicesService.findOne(serviceId)

    if (service.children.length === 0) {
      ctx.session.serviceId = serviceId
      await this.getChoiceDatePropmpt(ctx)
      return
    }

    const keyboardServices = service.children.map(subService => [
      {
        text: subService.name[lang],
        callback_data: `subService_${subService.id}`
      }
    ])

    const message = {
      ru: 'У этой услуги есть подуслуги, выберите одну из них:',
      kz: 'Бұл қызметтің ішінде қызметтер бар, олардан бірін таңдаңыз:'
    }

    await ctx.reply(`${message[lang]}`, {
      reply_markup: {
        inline_keyboard: keyboardServices
      }
    })
  }

  async getChoiceDatePropmpt(ctx: Context) {
    const lang = ctx.session.language

    const today = moment()
    const weekdays = this.getWeekdays(today)

    const keyboard = []
    for (let i = 0; i < weekdays.length; i += 4) {
      const row = weekdays.slice(i, i + 3).map(weekday => ({
        text: weekday.format('DD.MM.YYYY'),
        callback_data: `date_${weekday.format('YYYY-MM-DD')}`
      }))
      keyboard.push(row)
    }
    const message = {
      ru: 'Выберите дату для посещения.',
      kz: 'Келу күнін таңдаңыз.'
    }

    await ctx.reply(`${message[lang]}`, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  }

  private getWeekdays(startDate: moment.Moment): moment.Moment[] {
    const weekdays = []
    let currentDate = startDate.clone()
    let count = 0

    while (weekdays.length < 7) {
      if (currentDate.day() !== 6 && currentDate.day() !== 0) {
        weekdays.push(currentDate.clone())
      }
      currentDate.add(1, 'days')
      count++
    }

    return weekdays
  }
}
