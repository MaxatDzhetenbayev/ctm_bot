import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Center } from '../centers/entities/center.entity'
import { ManagerTable } from './entities/manager-table.entity'
import { Profile } from './entities/profile.entity'
import { Role } from './entities/role.entity'
import { User } from './entities/user.entity'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  imports: [
    SequelizeModule.forFeature([User, Role, Profile, Center, ManagerTable])
  ],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
