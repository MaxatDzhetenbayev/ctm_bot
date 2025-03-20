import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { Status } from '../../status/entities/status.entity'
import { Center } from '../centers/entities/center.entity'
import { Reception } from '../receptions/entities/reception.entity'
import { Service } from '../services/entities/service.entity'
import { ManagerTable } from '../users/entities/manager-table.entity'
import { Role } from '../users/entities/role.entity'
import { User } from '../users/entities/user.entity'
import { AuditLogsController } from './audit-logs.controller'
import { AuditLogsService } from './audit-logs.service'

@Module({
  imports: [
    SequelizeModule.forFeature([
      Reception,
      User,
      Center,
      Role,
      Service,
      Status,
      ManagerTable
    ])
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService]
})
export class AuditLogsModule {}
