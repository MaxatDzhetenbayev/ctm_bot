import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Profile } from "./entities/profile.entity";
import { Center } from "../centers/entities/center.entity";

@Module({
  controllers: [UsersController],
  imports: [SequelizeModule.forFeature([User, Role, Profile, Center])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
