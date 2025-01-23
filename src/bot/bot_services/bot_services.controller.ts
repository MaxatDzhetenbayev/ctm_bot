import * as moment from "moment";
import { BotServicesService } from "./bot_services.service";
import { Action, Ctx, Update } from "nestjs-telegraf";
import { Context } from "vm";

@Update()
export class BotServicesController {
  constructor(private readonly botServicesService: BotServicesService) {}

  @Action(/services_(.+)/)
  async onServices(@Ctx() ctx: Context) {
    const centerId = ctx.match[1];
    await this.botServicesService.showServices(ctx, centerId);
  }

  @Action(/service_(.+)/)
  async onService(@Ctx() ctx: Context) {
    const serviceId = ctx.match[1];
    await this.botServicesService.showService(ctx, serviceId);
  }

  @Action(/subService_(\d+)/)
  async onSubServiceSelect(@Ctx() ctx: Context) {
    const subServiceId = parseInt(ctx.match[1]);
    ctx.session.selectedSubServiceId = subServiceId;
    await ctx.reply(`Вы выбрали усугу с ID: ${subServiceId}`);

    this.getChoiceDatePropmpt(ctx);
  }

  //   TODO: Установка времени
  // 1. Если мы будем заранее предлагать уже доступные временные слоты, то нам нужно будет проверять их доступность
  // 2. Тогда нам нужно
  @Action(/^date_(\d{2}.\d{2}.\d{4})$/) // date_01.01.2021
  async onDateSelected(ctx: Context) {
    const selectedDate = ctx.match[1];
    ctx.session.date = selectedDate;

    const date = moment(selectedDate, "YYYYMMDD").format("DD.MM.YYYY");

    await ctx.reply(`Вы выбрали дату: ${date}`);

    await ctx.reply("Выберите время");
  }

  async getChoiceDatePropmpt(ctx: Context) {
    const today = moment();
    const weekdays = this.getWeekdays(today);

    const keyboard = weekdays.map((date) => ({
      text: date.format("DD.MM"),
      callback_data: `date_${date.format("DD.MM.YYYY")}`,
    }));

    await ctx.reply("Выберите дату для посещения.", {
      reply_markup: {
        inline_keyboard: [keyboard],
      },
    });
  }

  getWeekdays(startDate: moment.Moment): moment.Moment[] {
    const weekdays = [];
    let currentDate = startDate.clone();
    let count = 0;

    while (weekdays.length < 7) {
      if (currentDate.day() !== 6 && currentDate.day() !== 0) {
        weekdays.push(currentDate.clone());
      }
      currentDate.add(1, "days");
      count++;
    }

    return weekdays;
  }
}
