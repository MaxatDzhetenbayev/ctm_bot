import { Module } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { ServicesController } from "./services.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Service } from "./entities/service.entity";
import { ManagerServices } from "./entities/manager-services.entity";

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [SequelizeModule.forFeature([Service, ManagerServices])],
  exports: [ServicesService],
})
export class ServicesModule {}
