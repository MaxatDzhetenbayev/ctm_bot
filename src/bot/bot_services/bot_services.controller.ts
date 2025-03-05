import * as moment from 'moment'
import { BotServicesService } from './bot_services.service'
import { Action, Ctx, Update } from 'nestjs-telegraf'
import { Context } from 'vm'
import { ReceptionsService } from 'src/general/receptions/receptions.service'
import { UsersService } from 'src/general/users/users.service'

@Update()
export class BotServicesController {
  constructor(
    private readonly botServicesService: BotServicesService,
    private readonly receptionsService: ReceptionsService,
    private readonly userService: UsersService
  ) { }

  @Action(/services_(.+)/)
  async onServices(@Ctx() ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const centerId = ctx.match[1]

    await this.botServicesService.showServices(ctx, centerId)
  }

  @Action(/service_(.+)/)
  async onService(@Ctx() ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const serviceId = ctx.match[1]
    await this.botServicesService.showService(ctx, serviceId)
  }

  @Action(/subService_(\d+)/)
  async onSubServiceSelect(@Ctx() ctx: Context) {
    const subServiceId = parseInt(ctx.match[1])
    ctx.session.serviceId = subServiceId

    this.botServicesService.getChoiceDatePropmpt(ctx)
  }

  @Action(/^date_(\d{4}-\d{2}-\d{2})$/)
  async onDateSelected(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const lang = ctx.session.language
    const selectedDate = ctx.match[1]
    const formattedDate = moment.utc(selectedDate).startOf('day').toISOString()
    ctx.session.date = formattedDate

    const timeSlots = await this.receptionsService.findFreeTimeSlots(
      ctx.session.centerId,
      ctx.session.serviceId,
      ctx.session.date
    )

    const keyboard = []
    for (let i = 0; i < timeSlots.length; i += 4) {
      keyboard.push(
        timeSlots.slice(i, i + 4).map(time => ({
          text: time,
          callback_data: `pre_appointment_${time}`
        }))
      )
    }

    const message = {
      ru: 'Выберите время на дату',
      kz: 'Келу уақытын таңдаңыз'
    }

    await ctx.reply(`${message[lang]}: ${selectedDate}`, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    })
  }

  @Action(/^pre_appointment_(\d{2}:\d{2})$/)
  async onAppointmentSelected(ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const lang = ctx.session.language
    const time = ctx.match[1]
    ctx.session.time = time

    const center = ctx.session.centerId

    const message = {
      ru: {
        data: 'Ваши данные для записи',
        date: 'Дата',
        time: 'Время',
        iin: 'ИИН',
        full_name: 'ФИО',
        phone: 'Телефон',
        isAccept: 'Подтвердить запись?',
        accept: 'Подтвердить',
        repeat: 'Записаться заново'
      },
      kz: {
        data: 'Тіркелу деректеріңіз',
        date: 'Күні',
        time: 'Уақыты',
        iin: 'ЖСН',
        full_name: 'Аты-жөніңіз',
        phone: 'Телефон',
        isAccept: 'Жазбаңызды растайсыз ба?',
        accept: 'Растау',
        repeat: 'Қайта тіркелу'
      }
    }

    await ctx.reply(`${message[lang].data}:
		\n${message[lang].date}: ${moment(ctx.session.date).format('DD.MM.YYYY')}
		\n${message[lang].time}: ${ctx.session.time}
		\n${message[lang].iin}: ${ctx.session.iin}
		\n${message[lang].full_name}: ${ctx.session.full_name}
		\n${message[lang].phone}: ${ctx.session.phone}
		`)

    await ctx.reply(`${message[lang].isAccept}`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: `${message[lang].accept}`, callback_data: 'confirm_appointment' },
            { text: `${message[lang].repeat}`, callback_data: `services_${center}` }
          ]
        ]
      }
    })
  }

  @Action('confirm_appointment')
  async onAppointmentConfirm(ctx: Context) {

    const lang = ctx.session.language

    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }

    const user = await this.userService.validateUserByTelegram(
      ctx.from.id.toString()
    )

    if (!user) {
      await ctx.reply(
        'Вы не зарегистрированы. Пожалуйста, пройдите регистрацию.'
      )
      return
    }

    const body = {
      center_id: ctx.session.centerId,
      service_id: ctx.session.serviceId,
      user_id: user.id,
      date: ctx.session.date,
      time: ctx.session.time
    }

    const data = await this.receptionsService.choiceManager(body)

    if (!data) {
      await ctx.reply(
        'К сожалению, все слоты заняты. Попробуйте записаться на другое время.'
      )
      return
    }

    const { reception, center, service, profile, table, cabinet } = data


    const message = {
      ru: {
        success: 'Вы успешно записаны!',
        center: 'Центр',
        service: 'Сервис',
        manager: 'Менеджер',
        cabinet: 'Кабинет',
        table: 'Стол',
        date: 'Дата',
        time: 'Время'
      },
      kz: {
        success: 'Сіз тіркелдіңіз!',
        center: 'Орталық',
        service: 'Қызмет түрі',
        manager: 'Маман',
        cabinet: 'Кабинет',
        table: 'Үстел',
        date: 'Күні',
        time: 'Уақыты'
      }
    }

    await ctx.reply(
      `${message[lang].success}
    	\n${message[lang].center}: ${center[ctx.session.language]}
    	\n${message[lang].service}: ${service[ctx.session.language]}
    	\n${message[lang].manager}: ${profile.full_name}
    	\n${message[lang].table}: ${table}
    	\n${message[lang].cabinet}: ${cabinet}
    	\n${message[lang].date}: ${moment(reception.date).format('DD.MM.YYYY')}
    	\n${message[lang].time}: ${reception.time}`
    )
  }
}
