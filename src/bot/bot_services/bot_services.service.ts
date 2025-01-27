import { Injectable } from "@nestjs/common";
import { ServicesService } from "src/manage/services/services.service";

@Injectable()
export class BotServicesService {
  constructor(private readonly servicesService: ServicesService) {}

  async showServices(ctx, centerId) {
	console.log(centerId)
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
      await ctx.reply(`Вы выбрали усугу с ID: ${serviceId}`);
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
}
