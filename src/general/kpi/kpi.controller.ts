import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { KpiService } from './kpi.service'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/guards/roles.decorator'
import { RoleType } from '../users/entities/role.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Request } from 'express'

interface RequestWithUser extends Request {
  user: {
    id: number;
    login: string;
    role: string;
  };
}

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/completed')
  async findLastWeekday(@Req() req: RequestWithUser): Promise<number[]> {
    const managerId = req.user.id
    return this.kpiService.getReceptionsPerWeekday(managerId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/summary')
  async getStats(@Req() req: RequestWithUser): Promise<{
    total: number;
    completed: number;
    declined: number;
  }> {
    const managerId = req.user.id
    return this.kpiService.getReceptionStatsPerWeekday(managerId)
  }
}
