import { Module } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Reception } from "src/manage/receptions/entities/reception.entity";
import { User } from "../users/entities/user.entity";
import { Service } from "src/manage/services/entities/service.entity";
import { Profile } from "../users/entities/profile.entity";
import { ManagerTable } from "../users/entities/manager-table.entity";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Reception,
      User,
      Service,
      Profile,
      ManagerTable,
    ]),
  ],
  providers: [NotificationsService],
})
export class NotificationsModule {}
