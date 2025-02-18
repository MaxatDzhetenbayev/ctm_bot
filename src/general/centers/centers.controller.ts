import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'
import { CentersService } from './centers.service'
import {
  ApiCentersTag,
  ApiCreateCenter,
  ApiDeleteCenter,
  ApiFindAllCenters,
  ApiFindOneCenter,
  ApiUpdateCenter
} from './centers.swagger'
import { CreateCenterDto } from './dto/create-center.dto'
import { UpdateCenterDto } from './dto/update-center.dto'

@ApiCentersTag()
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  @ApiCreateCenter()
  create(@Body() createCenterDto: CreateCenterDto) {
    return this.centersService.create(createCenterDto)
  }

  @Get()
  @ApiFindAllCenters()
  findAll() {
    return this.centersService.findAll()
  }

  @Get(':id')
  @ApiFindOneCenter()
  findOne(@Param('id') id: string) {
    return this.centersService.findOne(+id)
  }

  @Patch(':id')
  @ApiUpdateCenter()
  update(@Param('id') id: string, @Body() updateCenterDto: UpdateCenterDto) {
    return this.centersService.update(+id, updateCenterDto)
  }

  @Delete(':id')
  @ApiDeleteCenter()
  remove(@Param('id') id: string) {
    return this.centersService.remove(+id)
  }
}
