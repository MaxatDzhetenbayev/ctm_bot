import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { ReceptionsService } from './receptions.service'
import {
  ApiChangeReceptionStatus,
  ApiCreateReception,
  ApiFindAllReceptions,
  ApiFindReceptionById,
  ApiReceptionsTags
} from './receptions.swagger'


interface CustomRequest extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@ApiReceptionsTags()
@Controller('receptions')
export class ReceptionsController {
  constructor(private readonly receptionsService: ReceptionsService) { }

  @ApiCreateReception()
  @Post()
  create(
    @Body()
    body: {
      center_id: number
      service_id: number
      user_id: number
      date: string
      time: string
    }
  ) {
    return this.receptionsService.choiceManager(body)
  }


  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Post('offline')
  createOffline(
    @Body()
    body: {
      visitor_type_id: number,
      full_name: string,
      iin: string,
      phone: string,
      service_id: number
    },
    @Req() req: CustomRequest
  ) {
    return this.receptionsService.createOffLiineReceptions(body, req.user)
  }

  @ApiFindAllReceptions()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get()
  findAll(@Req() req) {
    const id = req.user.id
    return this.receptionsService.findAll(id)
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.admin, RoleType.superadmin)
  @Get('managers/:manager_id')
  findAllByManager(@Param('manager_id') manager_id: number) {
    return this.receptionsService.getAllByManagerId(manager_id)
  }

  @ApiFindReceptionById()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager, RoleType.admin, RoleType.superadmin)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receptionsService.findOne(+id)
  }

  @ApiChangeReceptionStatus()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Patch(':id/status')
  changeStatus(@Query('status') status: number, @Param('id') id: number) {
    return this.receptionsService.changeReceptionStatus(id, status)
  }
}
