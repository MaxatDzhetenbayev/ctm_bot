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

@ApiReceptionsTags()
@Controller('receptions')
export class ReceptionsController {
  constructor(private readonly receptionsService: ReceptionsService) {}

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

  @ApiFindAllReceptions()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get()
  findAll(@Req() req) {
    const id = req.user.id

    return this.receptionsService.findAll(id)
  }

  @ApiFindReceptionById()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
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
