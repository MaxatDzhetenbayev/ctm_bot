import { Module } from "@nestjs/common";
import { ReceptionsService } from "./receptions.service";
import { ReceptionsController } from "./receptions.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Reception } from "./entities/reception.entity";
import { User } from "src/general/users/entities/user.entity";
import { Center } from "../centers/entities/center.entity";
import { Service } from "../services/entities/service.entity";
import { Role } from "src/general/users/entities/role.entity";
import { Status } from "src/status/entities/status.entity";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [ReceptionsController],
  providers: [ReceptionsService],
  imports: [
    SequelizeModule.forFeature([
      Reception,
      User,
      Center,
      Role,
      Service,
      Status,
    ]),
    UsersModule
  ],
  exports: [ReceptionsService],
})
export class ReceptionsModule { }
