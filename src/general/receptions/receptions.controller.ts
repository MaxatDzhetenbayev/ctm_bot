import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ReceptionsService } from "./receptions.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/guards/roles.decorator";
import { RoleType } from "../users/entities/role.entity";

@Controller("receptions")
export class ReceptionsController {
  constructor(private readonly receptionsService: ReceptionsService) {}

  //   @Post()
  //   create(@Body() createReceptionDto: CreateReceptionDto) {
  //     return this.receptionsService.create();
  //   }

  //   @Get()
  //   findFreeTimeSlots(
  //     @Query("centerId") centerId: number,
  //     @Query("serviceId") serviceId: number,
  //     @Query("date") date: string
  //   ) {
  //     return this.receptionsService.findFreeTimeSlots(centerId, serviceId, date);
  //   }

  @Post()
  create(
    @Body()
    body: {
      center_id: number;
      service_id: number;
      user_id: number;
      date: string;
      time: string;
    }
  ) {
    return this.receptionsService.choiceManager(body);
  }

  //   @Get(":id")
  //   findOne(@Param("id") id: string) {
  //     return this.receptionsService.findOne(+id);
  //   }

  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get()
  findAll(@Req() req) {
    // console.log(req.user);

    const id = req.user.id;

    return this.receptionsService.findAll(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.receptionsService.findOne(+id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Patch(":id/status")
  changeStatus(@Query("status") status: number, @Param("id") id: number) {
    return this.receptionsService.changeReceptionStatus(id, status);
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
