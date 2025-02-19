import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { KpiService } from './kpi.service'
import {
  ApiFindLastWeekday,
  ApiFindLastWeekdayByCenter,
  ApiFindLastWeekdayById,
  ApiGetDailySummaryByCenter,
  ApiGetStats,
  ApiGetStatsByCenter,
  ApiGetSummary,
  ApiGetSummaryById,
  ApiKpiTags
} from './kpi.swagger'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string }
}

@ApiKpiTags()
@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  // Количество завершенных приемов за неделю (пн-пт).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/completed')
  @ApiFindLastWeekday()
  async findLastWeekday(
    @Req() req: RequestWithUser
  ): Promise<Record<string, number>> {
    const managerId = req.user.id
    return this.kpiService.getReceptionsPerWeekday(managerId)
  }

  // Количество завершенных приемов за неделю (пн-пт) по ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get(':id/weekday/completed')
  @ApiFindLastWeekdayById()
  async findLastWeekdayById(
    @Param('id') id: number
  ): Promise<Record<string, number>> {
    return this.kpiService.getReceptionsPerWeekday(id)
  }

  // Количество завершенных приемов за неделю (пн-пт) по ID центра
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/:centerId/weekday/completed')
  @ApiFindLastWeekdayByCenter()
  async findLastWeekdayByCenter(
    @Param('centerId') centerId: number
  ): Promise<Record<number, Record<string, number>>> {
    return this.kpiService.getReceptionsPerWeekdayByCenter(centerId)
  }

  // Количество общих, завершенных и отказных приемов за неделю (пн-пт) авторизованного пользователя
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/stats')
  @ApiGetStats()
  async getStats(
    @Req() req: RequestWithUser
  ): Promise<{ total: number; completed: number; declined: number }> {
    const managerId = req.user.id
    return this.kpiService.getReceptionStatsPerWeekday(managerId)
  }

  // Количество общих, завершенных и отказных приемов за неделю (пн-пт) по ID центра
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/:centerId/weekday/stats')
  @ApiGetStatsByCenter()
  async getStatsByCenter(
    @Param('centerId') centerId: number
  ): Promise<
    Record<number, { total: number[]; completed: number[]; declined: number[] }>
  > {
    return this.kpiService.getReceptionStatsPerWeekdayByAllManagers(centerId)
  }

  // Метрики за день авторизованного пользователя
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('today/summary')
  @ApiGetSummary()
  async getSummary(@Req() req: RequestWithUser): Promise<{
    totalReceptions: number
    problematicRate: number
    averageRating: number
    managerLoad: number
  }> {
    const managerId = req.user.id
    const [totalReceptions, problematicRate, averageRating, managerLoad] =
      await Promise.all([
        this.kpiService.getTotalReceptionsToday(managerId),
        this.kpiService.getProblematicReceptionsRate(managerId),
        this.kpiService.getAverageClientRating(managerId),
        this.kpiService.getManagerLoadToday(managerId)
      ])

    return { totalReceptions, problematicRate, averageRating, managerLoad }
  }

  // Метрики за день по ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get(':id/today/summary')
  @ApiGetSummaryById()
  async getSummaryById(@Param('id') id: number): Promise<{
    totalReceptions: number
    problematicRate: number
    averageRating: number
    managerLoad: number
  }> {
    const [totalReceptions, problematicRate, averageRating, managerLoad] =
      await Promise.all([
        this.kpiService.getTotalReceptionsToday(id),
        this.kpiService.getProblematicReceptionsRate(id),
        this.kpiService.getAverageClientRating(id),
        this.kpiService.getManagerLoadToday(id)
      ])

    return { totalReceptions, problematicRate, averageRating, managerLoad }
  }

  // Метрики за день по ID центра
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/:centerId/today/summary')
  @ApiGetDailySummaryByCenter()
  async getDailySummaryByCenter(@Param('centerId') centerId: number): Promise<
    Record<
      number,
      {
        totalReceptions: number
        problematicRate: number
        averageRating: number
        managerLoad: number
      }
    >
  > {
    return this.kpiService.getDailySummaryByCenter(centerId)
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
