import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
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
  findAll() {
    return this.servicesService.findAll()
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
