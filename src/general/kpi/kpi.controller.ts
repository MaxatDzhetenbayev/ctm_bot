import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { KpiService } from './kpi.service'
import { ApiFindLastWeekdayByCenter, ApiKpiTags } from './kpi.swagger'
// import { CurrentUserId } from '../auth/decorators/current-user-id.decorator'
import { Request } from 'express'

interface CustomRequest extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@ApiKpiTags()
@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  // Количество завершенных приемов менеджера за неделю
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager, RoleType.admin, RoleType.superadmin)
  @Get([
    'managers/me/weekday/repections/completed',
    'managers/:id/weekday/repections/completed'
  ])
  async getLastWorkWeekdayCompletedReceptionsByManager(
    @Req() req: CustomRequest
  ) {
    const managerId = Number(req.params.id) || req.user.id
    return this.kpiService.getReceptionsPerWeekday({ managerId })
  }

  // Количество завершенных приемов центра за неделю
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin, RoleType.superadmin)
  @Get([
    'centers/managers/weekday/receptions/completed',
    'centers/:centerId/managers/weekday/receptions/completed'
  ])
  @ApiFindLastWeekdayByCenter()
  async getLastWorkWeekdayCompletedReceptionsByCenter(
    @Req() req: CustomRequest
  ): Promise<Record<string, number>> {
    const centerId = Number(req.params.centerId) || req.user.center_id
    return this.kpiService.getReceptionsPerWeekday({ centerId })
  }

  // Статистика  менеджера за текущий рабочий день
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager, RoleType.admin, RoleType.superadmin)
  @Get(['managers/me/today/summary', 'managers/:id/today/summary'])
  async getTodaySummaryByManager(@Req() req: CustomRequest) {
    const managerId = Number(req.params.id) || req.user.id
    return this.kpiService.getTodaySummary({ managerId })
  }

  // Статистика  центра за текущий рабочий день
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager, RoleType.admin, RoleType.superadmin)
  @Get([
    'centers/managers/today/summary',
    'centers/:centerId/managers/today/summary'
  ])
  async getTodayCenterSummaryByManager(@Req() req: CustomRequest) {
    const centerId = Number(req.params.centerId) || req.user.center_id
    return this.kpiService.getTodaySummary({ centerId })
  }
}
