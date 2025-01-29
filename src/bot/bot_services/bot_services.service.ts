import { Injectable } from "@nestjs/common";
import { ServicesService } from "src/manage/services/services.service";
import { Context } from "vm";
import * as moment from "moment";

@Injectable()
export class BotServicesService {
  constructor(private readonly servicesService: ServicesService) {}

  async showServices(ctx, centerId) {
    ctx.session.centerId = centerId;

    const services = await this.servicesService.findAll();

    const keyboardServices = services.map((service) => [
      {
        text: service.name[ctx.session.language],
        callback_data: `service_${service.id}`,
      },
    ]);

    await ctx.reply("Выберите услугу", {
      reply_markup: { inline_keyboard: keyboardServices },
    });
  }

  async showService(ctx, serviceId) {
    const service = await this.servicesService.findOne(serviceId);

    if (service.children.length === 0) {
      ctx.session.serviceId = serviceId;
      await this.getChoiceDatePropmpt(ctx);
      return;
    }

    const keyboardServices = service.children.map((subService) => ({
      text: subService.name[ctx.session.language],
      callback_data: `subService_${subService.id}`,
    }));

    await ctx.reply("У этой услуги есть подуслуги, выберите одну из них:", {
      reply_markup: {
        inline_keyboard: [keyboardServices],
      },
    });
  }

  async getChoiceDatePropmpt(ctx: Context) {
    //  ctx.deleteMessage();

    const today = moment();
    const weekdays = this.getWeekdays(today);

    const keyboard = [];
    for (let i = 0; i < weekdays.length; i += 4) {
      const row = weekdays.slice(i, i + 3).map((weekday) => ({
        text: weekday.format("DD.MM.YYYY"),
        callback_data: `date_${weekday.format("YYYY-MM-DD")}`,
      }));
      keyboard.push(row);
    }

    await ctx.reply("Выберите дату для посещения.", {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private getWeekdays(startDate: moment.Moment): moment.Moment[] {
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
