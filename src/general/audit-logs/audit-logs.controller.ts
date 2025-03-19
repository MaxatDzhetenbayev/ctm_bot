import { Controller } from '@nestjs/common'
import { AuditLogsService } from './audit-logs.service'

@Controller('kpi')
export class AuditLogsController {
  constructor(private readonly kpiService: AuditLogsService) {}
}
