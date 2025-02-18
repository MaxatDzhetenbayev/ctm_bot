import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { KpiService } from './kpi.service'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string }
}

@ApiTags('KPI') // Группа API в Swagger
@ApiCookieAuth('access_token')
@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  // Количество завершенных приемов за неделю (пн-пт).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/completed')
  @ApiOperation({
    summary:
      'Количество завершенных приемов за неделю (пн-пт) для авторизованного менеджера'
  })
  @ApiResponse({
    status: 200,
    description: 'Объект с завершенными приемами по дням недели',
    schema: { example: [0, 0, 0, 0, 0] }
  })
  async findLastWeekday(@Req() req: RequestWithUser): Promise<number[]> {
    const managerId = req.user.id
    return this.kpiService.getReceptionsPerWeekday(managerId)
  }

  // Количество завершенных приемов за неделю (пн-пт) по ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get(':id/weekday/completed')
  @ApiOperation({
    summary: 'Количество завершенных приемов за неделю (пн-пт) по manager_id'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID менеджера' })
  @ApiResponse({
    status: 200,
    description: 'Объект с завершенными приемами по дням недели',
    schema: { example: [0, 0, 0, 0, 0] }
  })
  async findLastWeekdayById(@Param('id') id: number): Promise<number[]> {
    return this.kpiService.getReceptionsPerWeekday(id)
  }

  // Количество завершенных приемов за неделю (пн-пт) по ID центра
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(RoleType.admin)
  @Get('center/:centerId/weekday/completed')
  @ApiOperation({
    summary: 'Количество завершенных приемов за неделю (пн-пт) по ID центра'
  })
  @ApiParam({ name: 'centerId', type: Number, description: 'ID центра' })
  @ApiResponse({
    status: 200,
    description: 'Объект с завершенными приемами по дням недели',
    schema: { example: { '18': [8, 0, 0, 0, 0] } }
  })
  async findLastWeekdayByCenter(
    @Param('centerId') centerId: number
  ): Promise<Record<number, number[]>> {
    return this.kpiService.getReceptionsPerWeekdayByAllManagers(centerId)
  }

  // Количество общих, завершенных и отказных приемов за неделю (пн-пт) авторизованного пользователя
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.manager)
  @Get('weekday/stats')
  @ApiOperation({
    summary:
      'Статистика приемов за неделю (пн-пт) для авторизованного менеджера'
  })
  @ApiResponse({
    status: 200,
    description: 'Общее количество, завершенные, отказанные приемы',
    schema: { example: { total: 8, completed: 8, declined: 0 } }
  })
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
  @ApiOperation({
    summary: 'Статистика приемов за неделю (пн-пт) для всех менеджеров центра'
  })
  @ApiParam({ name: 'centerId', type: Number, description: 'ID центра' })
  @ApiResponse({
    status: 200,
    description: 'Объект с manager_id как ключом и статистикой по 5 дням',
    schema: {
      example: {
        '18': {
          total: [8, 0, 0, 0, 0],
          completed: [8, 0, 0, 0, 0],
          declined: [0, 0, 0, 0, 0]
        }
      }
    }
  })
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
  @ApiOperation({ summary: 'Метрики за день для авторизованного менеджера' })
  @ApiResponse({
    status: 200,
    description: 'Объект с общими показателями за день',
    schema: {
      example: {
        totalReceptions: 0,
        problematicRate: 0,
        averageRating: 0,
        managerLoad: 0
      }
    }
  })
  async getSummary(
    @Req() req: RequestWithUser
  ): Promise<{
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
  @ApiOperation({ summary: 'Метрики за день для авторизованного менеджера' })
  @ApiResponse({
    status: 200,
    description: 'Объект с общими показателями за день',
    schema: {
      example: {
        totalReceptions: 0,
        problematicRate: 0,
        averageRating: 0,
        managerLoad: 0
      }
    }
  })
  async getSummaryById(
    @Param('id') id: number
  ): Promise<{
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
  @ApiOperation({ summary: 'Метрики за день для всех менеджеров центра' })
  @ApiParam({ name: 'centerId', type: Number, description: 'ID центра' })
  @ApiResponse({
    status: 200,
    description: 'Объект с manager_id как ключом и показателями за день',
    schema: {
      example: {
        '18': {
          totalReceptions: 0,
          problematicRate: 0,
          averageRating: 0,
          managerLoad: 0
        }
      }
    }
  })
  async getDailySummaryByCenter(
    @Param('centerId') centerId: number
  ): Promise<
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
