import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./entities/user.entity";
import { Role } from "./entities/role.entity";
import { Profile } from "./entities/profile.entity";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
  controllers: [UsersController],
  imports: [SequelizeModule.forFeature([User, Role, Profile])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
