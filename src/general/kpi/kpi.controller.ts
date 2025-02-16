import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { KpiService } from './kpi.service' // Указать путь к KpiService
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/guards/roles.decorator'
import { RoleType } from '../users/entities/role.entity'

@Controller('kpi')
export class KpiController {
  constructor(private readonly kpiService: KpiService) {
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get('last-weekday/:id')
  async findOne(@Param('id') id: string): Promise<number[]> {
    return this.kpiService.getReceptionsPerWeekday(+id)
  }
}