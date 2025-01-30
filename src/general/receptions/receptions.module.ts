import { Module } from "@nestjs/common";
import { ReceptionsService } from "./receptions.service";
import { ReceptionsController } from "./receptions.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Reception } from "./entities/reception.entity";
import { User } from "src/general/users/entities/user.entity";
import { Center } from "../centers/entities/center.entity";
import { Service } from "../services/entities/service.entity";
import { Role } from "src/general/users/entities/role.entity";

@Module({
  controllers: [ReceptionsController],
  providers: [ReceptionsService],
  imports: [
    SequelizeModule.forFeature([Reception, User, Center, Role, Service]),
  ],
  exports: [ReceptionsService],
})
export class ReceptionsModule {}
