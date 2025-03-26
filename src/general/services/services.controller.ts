import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { ServicesService } from './services.service'
import {
  ApiCreateService,
  ApiDeleteService,
  ApiFindAllServices,
  ApiFindServiceById,
  ApiServicesTags,
  ApiUpdateService
} from './services.swagger'
import { RolesGuard } from '../auth/guards/roles.guard'
import { RoleType } from '../users/entities/role.entity'
import { Roles } from '../auth/guards/roles.decorator'

interface CustomRequest extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@ApiServicesTags()
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @ApiCreateService()
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto)
  }

  @ApiFindAllServices()
  @Get()
  findAll(@Query('tree') tree: string) {
    return this.servicesService.findAll(null, tree)
  }

  @UseGuards(RolesGuard)
  @Roles(RoleType.manager)
  @Get('manager')
  findManagerServices(@Req() req: CustomRequest) {
    return this.servicesService.getManagerServices(req.user)
  }

  @ApiFindServiceById()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id)
  }



  @ApiUpdateService()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto)
  }

  @ApiDeleteService()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id)
  }
}
