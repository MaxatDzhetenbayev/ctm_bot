import { Module } from "@nestjs/common";
import { CentersService } from "./centers.service";
import { CentersController } from "./centers.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Center } from "./entities/center.entity";
import { UsersCenter } from "./entities/managers_center.entity";

@Module({
  controllers: [CentersController],
  providers: [CentersService],
  imports: [SequelizeModule.forFeature([Center, UsersCenter])],
  exports: [CentersService],
})
export class CentersModule {}
