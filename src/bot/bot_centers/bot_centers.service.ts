import { Injectable } from "@nestjs/common";
import { CentersService } from "src/manage/centers/centers.service";
import { Context } from "vm";

@Injectable()
export class BotCentersService {
  constructor(private readonly centerService: CentersService) {}

  async showCenters(ctx: Context, language: string) {
    const centers = await this.centerService.findAll();
    const keyboardCenters = centers.map((center) => [
      { text: center.name[language], callback_data: `center_${center.id}` },
    ]);

    await ctx.reply("Выберите центр", {
      reply_markup: { inline_keyboard: keyboardCenters },
    });
  }
}
