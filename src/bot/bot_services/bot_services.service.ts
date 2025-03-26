import { Injectable } from '@nestjs/common'
import { ServicesService } from 'src/general/services/services.service'
import { Context } from 'vm'
import * as moment from 'moment'
import { message } from 'src/config/translations'
import { UsersService } from 'src/general/users/users.service'

@Injectable()
export class BotServicesService {
  constructor(private readonly servicesService: ServicesService,
    private readonly userService: UsersService
  ) { }

  async showServices(ctx, centerId) {
    if (ctx.session.preAppointmentMessageId) {
      await ctx.deleteMessage(ctx.session.preAppointmentMessageId)
    }

    const chatId = String(ctx.chat?.id)
    const { visitor_type_id } = await this.userService.validateUserByTelegram(chatId)

    ctx.session.centerId = centerId
    const lang = ctx.session.language
    const services = await this.servicesService.findAll(visitor_type_id, 'true')

    const keyboardServices = services.map(service => [
      {
        text: service.name[ctx.session.language],
        callback_data: `service_${service.id}`
      }
    ])

    await ctx.reply(`${message[lang].choice_service}`, {
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

    await ctx.reply(`${message[lang].sub_service}`, {
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

    await ctx.reply(`${message[lang].choice_date}`, {
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
