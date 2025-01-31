import * as moment from "moment";
import { BotServicesService } from "./bot_services.service";
import { Action, Ctx, Update } from "nestjs-telegraf";
import { Context } from "vm";
import { ReceptionsService } from "src/general/receptions/receptions.service";
import { UsersService } from "src/general/users/users.service";

@Update()
export class BotServicesController {
  constructor(
    private readonly botServicesService: BotServicesService,
    private readonly receptionsService: ReceptionsService,
    private readonly userService: UsersService
  ) {}

  @Action(/services_(.+)/)
  async onServices(@Ctx() ctx: Context) {
   //  ctx.deleteMessage();
    const centerId = ctx.match[1];

    await this.botServicesService.showServices(ctx, centerId);
  }

  @Action(/service_(.+)/)
  async onService(@Ctx() ctx: Context) {
   //  ctx.deleteMessage();
    const serviceId = ctx.match[1];
    await this.botServicesService.showService(ctx, serviceId);
  }

  @Action(/subService_(\d+)/)
  async onSubServiceSelect(@Ctx() ctx: Context) {
    const subServiceId = parseInt(ctx.match[1]);
    ctx.session.serviceId = subServiceId;

    this.botServicesService.getChoiceDatePropmpt(ctx);
  }

  @Action(/^date_(\d{4}-\d{2}-\d{2})$/)
  async onDateSelected(ctx: Context) {
    const selectedDate = ctx.match[1];
    const formattedDate = moment.utc(selectedDate).startOf("day").toISOString();
    ctx.session.date = formattedDate;

    const timeSlots = await this.receptionsService.findFreeTimeSlots(
      ctx.session.centerId,
      ctx.session.serviceId,
      ctx.session.date
    );

    const keyboard = [];
    for (let i = 0; i < timeSlots.length; i += 4) {
      keyboard.push(
        timeSlots.slice(i, i + 4).map((time) => ({
          text: time,
          callback_data: `pre_appointment_${time}`,
        }))
      );
    }


   //  ctx.deleteMessage();

    await ctx.reply(`Выберите время на дату: ${selectedDate}`, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  @Action(/^pre_appointment_(\d{2}:\d{2})$/)
  async onAppointmentSelected(ctx: Context) {
   //  ctx.deleteMessage();

    const time = ctx.match[1];
    ctx.session.time = time;

    const center = ctx.session.centerId;

    await ctx.reply(`Ваши данные для записи:
		\nДата: ${moment(ctx.session.date).format("DD.MM.YYYY")}
		\nВремя: ${ctx.session.time}
		\nИИН: ${ctx.session.iin}
		\nФИО: ${ctx.session.full_name}
		\nТелефон: ${ctx.session.phone}
		`);

    await ctx.reply(`Подтвердить запись?`, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Подтвердить", callback_data: "confirm_appointment" },
            { text: "Записаться заново", callback_data: `services_${center}` },
          ],
        ],
      },
    });
  }

  @Action("confirm_appointment")
  async onAppointmentConfirm(ctx: Context) {
   //  ctx.deleteMessage();

    const user = await this.userService.validateUserByTelegram(ctx.from.id.toString());

    if (!user) {
      await ctx.reply(
        "Вы не зарегистрированы. Пожалуйста, пройдите регистрацию."
      );
      return;
    }

    const body = {
      center_id: ctx.session.centerId,
      service_id: ctx.session.serviceId,
      user_id: user.id,
      date: ctx.session.date,
      time: ctx.session.time,
    };

    const data = await this.receptionsService.choiceManager(body);

    if (!data) {
      await ctx.reply(
        "К сожалению, все слоты заняты. Попробуйте записаться на другое время."
      );
      return;
    }

    const { reception, center, service, profile, table } = data;

    await ctx.reply(
      `Вы успешно записаны!
    	\nЦентр: ${center[ctx.session.language]}
    	\nСервис: ${service[ctx.session.language]}
    	\nМенеджер: ${profile.full_name}
    	\nСтол: ${table}
    	\nДата: ${moment(reception.date).format("DD.MM.YYYY")}
    	\nВремя: ${reception.time}`
    );
  }
}
