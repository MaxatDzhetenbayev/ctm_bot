import { Module } from '@nestjs/common'
import { ManagerStatusService } from './manager_status.service'

@Module({
  providers: [ManagerStatusService],
  exports: [ManagerStatusService]
})
export class ServicesModule {}
