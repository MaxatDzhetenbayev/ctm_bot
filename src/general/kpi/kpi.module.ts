import { Module } from '@nestjs/common'
import { KpiService } from './kpi.service'
import { KpiController } from './kpi.controller'
import { SequelizeModule } from '@nestjs/sequelize'
import { Reception } from '../receptions/entities/reception.entity'
import { User } from '../users/entities/user.entity'
import { Center } from '../centers/entities/center.entity'
import { Role } from '../users/entities/role.entity'
import { Service } from '../services/entities/service.entity'
import { Status } from '../../status/entities/status.entity'

@Module({
  imports: [
    SequelizeModule.forFeature([
      Reception,
      User,
      Center,
      Role,
      Service,
      Status
    ])
  ],
  controllers: [KpiController],
  providers: [KpiService]
})
export class KpiModule {
}
