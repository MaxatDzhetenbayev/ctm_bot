import { Controller, Patch, Req, UseGuards } from '@nestjs/common'
import { ManagerStatusService } from './manager_status.service'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { Roles } from '../auth/guards/roles.decorator'

interface CustomRequest extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@Controller('manager_statuses')
export class ManagerStatusController {
  constructor(private readonly servicesService: ManagerStatusService) {}

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  update(@Req() req: CustomRequest) {
    return this.servicesService.update(req.user.id)
  }
}
