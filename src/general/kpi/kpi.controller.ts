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
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@ApiKpiTags()
@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  // Количество завершенных приемов за неделю
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager, RoleType.admin, RoleType.superadmin)
  @Get(['users/me/weekday/completed', 'users/:id/weekday/completed'])
  async findLastWeekday(@CurrentUserId() userId: number) {
    return this.kpiService.getReceptionsPerWeekday(userId)
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/weekday/completed')
  @ApiFindLastWeekdayByCenter()
  async findLastWeekdayByCenter(
    @Req() req: RequestWithUser
  ): Promise<Record<string, number>> {
    const stats = await this.kpiService.getReceptionsPerWeekdayByCenter(
      req.user.center_id
    )

    if (!stats || Object.keys(stats).length === 0) {
      return {}
    }

    const firstManagerKey = Object.keys(stats)[0]
    if (!firstManagerKey || !stats[firstManagerKey]) {
      return {}
    }

    const weekdays = Object.keys(stats[firstManagerKey])

    const aggregatedStats: Record<string, number> = weekdays.reduce(
      (acc, day) => {
        acc[day] = 0
        return acc
      },
      {} as Record<string, number>
    )

    Object.values(stats).forEach(managerStats => {
      Object.entries(managerStats).forEach(([day, count]) => {
        aggregatedStats[day] += count
      })
    })

    return aggregatedStats
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.admin)
  @Get('id/:id/weekday/stats')
  @ApiGetStats()
  async fundStatsById(
    @Param('id') id: number
  ): Promise<{ total: number; completed: number; declined: number }> {
    return this.kpiService.getReceptionStatsPerWeekday(id)
  }

  // // Количество общих, завершенных и отказных приемов за неделю (пн-пт) по ID центра, возвращает MANAGER ID: {TOTAL, COMPLETED, DECLINED}
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // // @Roles(RoleType.admin)
  // @Get('center/weekday/stats')
  // @ApiGetStatsByCenter()
  // async getStatsByCenter(
  //   @Req() req: RequestWithUser
  // ): Promise<
  //   Record<number, { total: number[]; completed: number[]; declined: number[] }>
  // > {
  //   return this.kpiService.getReceptionStatsPerWeekdayByAllManagers(
  //     req.user.center_id
  //   )
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('center/weekday/stats')
  @ApiGetStatsByCenter()
  async getStatsByCenter(
    @Req() req: RequestWithUser
  ): Promise<{ total: number; completed: number; declined: number }> {
    const stats =
      await this.kpiService.getReceptionStatsPerWeekdayByAllManagers(
        req.user.center_id
      )

    if (!stats || Object.keys(stats).length === 0) {
      return { total: 0, completed: 0, declined: 0 }
    }

    let total = 0
    let completed = 0
    let declined = 0

    Object.values(stats).forEach(managerStats => {
      total += managerStats.total.reduce((sum, value) => sum + value, 0)
      completed += managerStats.completed.reduce((sum, value) => sum + value, 0)
      declined += managerStats.declined.reduce((sum, value) => sum + value, 0)
    })

    return { total, completed, declined }
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

    return {
      totalReceptions,
      problematicRate,
      averageRating: parseFloat(averageRating.toFixed(2)),
      managerLoad
    }
  }

  // Метрики за день по ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('id/:id/today/summary')
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

    return {
      totalReceptions,
      problematicRate,
      averageRating: parseFloat(averageRating.toFixed(2)),
      managerLoad
    }
  }

  // Метрики за день по ID центра, возвращает статистику по центру, и по каждому менеджеру
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // // @Roles(RoleType.admin)
  // @Get('center/today/summary')
  // @ApiGetDailySummaryByCenter()
  // async getDailySummaryByCenter(@Req() req: RequestWithUser): Promise<
  //   Record<
  //     number,
  //     {
  //       totalReceptions: number
  //       problematicRate: number
  //       averageRating: number
  //       managerLoad: number
  //     }
  //   >
  // > {
  //   return this.kpiService.getDailySummaryByCenter(req.user.center_id)
  // }

  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/today/summary')
  @ApiGetDailySummaryByCenter()
  async getDailySummaryByCenter(@Req() req: RequestWithUser): Promise<{
    totalReceptions: number
    problematicRate: number
    averageRating: number
    managerLoad: number
  }> {
    const summaries = await this.kpiService.getDailySummaryByCenter(
      req.user.center_id
    )

    if (!summaries || Object.keys(summaries).length === 0) {
      return {
        totalReceptions: 0,
        problematicRate: 0,
        averageRating: 0,
        managerLoad: 0
      }
    }

    const totalManagers = Object.keys(summaries).length

    const totalReceptions = Object.values(summaries).reduce(
      (sum, curr) => sum + curr.totalReceptions,
      0
    )
    const problematicRate =
      Object.values(summaries).reduce(
        (sum, curr) => sum + curr.problematicRate,
        0
      ) / totalManagers
    const averageRating =
      Object.values(summaries).reduce(
        (sum, curr) => sum + curr.averageRating,
        0
      ) / totalManagers
    const managerLoad =
      Object.values(summaries).reduce(
        (sum, curr) => sum + curr.managerLoad,
        0
      ) / totalManagers

    return { totalReceptions, problematicRate, averageRating, managerLoad }
  }
}
