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

  //   @Post()
  //   create(@Body() createReceptionDto: CreateReceptionDto) {
  //     return this.receptionsService.create();
  //   }

  //   @ApiFindFreeTimeSlots()
  //   @Get()
  //   findFreeTimeSlots(
  //     @Query("centerId") centerId: number,
  //     @Query("serviceId") serviceId: number,
  //     @Query("date") date: string
  //   ) {
  //     return this.receptionsService.findFreeTimeSlots(centerId, serviceId, date);
  //   }
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

  //   @Get(":id")
  //   findOne(@Param("id") id: string) {
  //     return this.receptionsService.findOne(+id);
  //   }

  @ApiFindAllReceptions()
  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get()
  findAll(@Req() req) {
    // console.log(req.user);

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

  //   @Patch(":id")
  //   update(
  //     @Param("id") id: string,
  //     @Body() updateReceptionDto: UpdateReceptionDto
  //   ) {
  //     return this.receptionsService.update(+id, updateReceptionDto);
  //   }

  //   @Delete(":id")
  //   remove(@Param("id") id: string) {
  //     return this.receptionsService.remove(+id);
  //   }
}
