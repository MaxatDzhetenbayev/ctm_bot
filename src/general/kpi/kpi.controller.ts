import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
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
  @Get('weekday/stats')
  async getStats(@Req() req: RequestWithUser): Promise<{
    total: number;
    completed: number;
    declined: number;
  }> {
    const managerId = req.user.id
    return this.kpiService.getReceptionStatsPerWeekday(managerId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('today/summary')
  async getSummary(@Req() req: RequestWithUser): Promise<{
    totalReceptions: number;
    problematicRate: number;
    averageRating: number;
    managerLoad: number;
  }> {
    const managerId = req.user.id

    const [
      totalReceptions,
      problematicRate,
      averageRating,
      managerLoad
    ] = await Promise.all([
      this.kpiService.getTotalReceptionsToday(managerId),
      this.kpiService.getProblematicReceptionsRate(managerId),
      this.kpiService.getAverageClientRating(managerId),
      this.kpiService.getManagerLoadToday(managerId)
    ])

    return {
      totalReceptions,
      problematicRate,
      averageRating,
      managerLoad
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get(':id/weekday/completed')
  async findLastWeekdayById(
    @Param('id') id: number
  ): Promise<number[]> {
    return this.kpiService.getReceptionsPerWeekday(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get(':id/weekday/stats')
  async getStatsById(
    @Param('id') id: number
  ): Promise<{
    total: number;
    completed: number;
    declined: number;
  }> {
    return this.kpiService.getReceptionStatsPerWeekday(id)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get(':id/today/summary')
  async getSummaryById(
    @Param('id') id: number
  ): Promise<{
    totalReceptions: number;
    problematicRate: number;
    averageRating: number;
    managerLoad: number;
  }> {
    const [
      totalReceptions,
      problematicRate,
      averageRating,
      managerLoad
    ] = await Promise.all([
      this.kpiService.getTotalReceptionsToday(id),
      this.kpiService.getProblematicReceptionsRate(id),
      this.kpiService.getAverageClientRating(id),
      this.kpiService.getManagerLoadToday(id)
    ])

    return {
      totalReceptions,
      problematicRate,
      averageRating,
      managerLoad
    }
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.manager)
  // @Get('today/total-receptions')
  // async getTotalReceptionsToday(@Req() req: RequestWithUser): Promise<number> {
  //   const managerId = req.user.id
  //   return this.kpiService.getTotalReceptionsToday(managerId)
  // }
  //
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.manager)
  // @Get('today/problematic-rate')
  // async getProblematicRate(@Req() req: RequestWithUser): Promise<number> {
  //   const managerId = req.user.id
  //   return this.kpiService.getProblematicReceptionsRate(managerId)
  // }
  //
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.manager)
  // @Get('today/average-rating')
  // async getAverageRating(@Req() req: RequestWithUser): Promise<number> {
  //   const managerId = req.user.id
  //   return this.kpiService.getAverageClientRating(managerId)
  // }
  //
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.manager)
  // @Get('today/manager-load')
  // async getManagerLoad(@Req() req: RequestWithUser): Promise<number> {
  //   const managerId = req.user.id
  //   return this.kpiService.getManagerLoadToday(managerId)
  // }
}