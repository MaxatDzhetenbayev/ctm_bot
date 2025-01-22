import { Context } from "telegraf";
import { BotAppService } from "./bot-app.service";
import { Ctx, Start, Update } from "nestjs-telegraf";
import { Controller } from "@nestjs/common";

@Controller()
@Update()
export class BotAppController {
  constructor(private readonly appService: BotAppService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {

	
  }
}
