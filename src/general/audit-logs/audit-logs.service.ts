import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as moment from 'moment'
import { AuditLog } from './entities/audit-logs.entity'

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog)
    private readonly auditLogRepository: typeof AuditLog
  ) {}

  async getReceptionsPerWeekday({
    action,
    manager_id,
    center_id
  }: {
    action: string
    manager_id: number
    center_id: number
  }) {}
}
