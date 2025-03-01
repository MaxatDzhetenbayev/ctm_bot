import { Module } from "@nestjs/common";
import { BotCentersService } from "./bot_centers.service";
import { CentersModule } from "src/general/centers/centers.module";

@Module({
  providers: [BotCentersService],
  imports: [CentersModule],
  exports: [BotCentersService],
})
export class BotCentersModule {}
