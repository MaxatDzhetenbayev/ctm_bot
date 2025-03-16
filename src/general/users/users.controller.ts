import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common'
import { Response } from 'express'
import * as path from 'path'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreateUserDto } from './dto/create-user.dto'
import { RoleType } from './entities/role.entity'
import {
  ApiCreateManager,
  ApiCreateUser,
  ApiGetManagersByCenter,
  ApiGetProfile,
  ApiUpdateEmployee,
  ApiUsersTags
} from './users.swagger'
import { UsersService } from './users.service'
import { GetManagersDto } from './dto/get-managers.dto'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string; center_id: number }
}

@ApiUsersTags()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  // @UseGuards(RolesGuard)
  // @Roles(RoleType.superadmin, RoleType.admin, RoleType.manager)
  @Post()
  @ApiCreateUser()
  async create(@Body() body: CreateUserDto, @Req() req) {
    return this.usersService.createUser({
      dto: body,
      // !WARNING req.user.role
      creater_role: null
    })
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiGetProfile()
  async getProfile(@Req() req) {
    return this.usersService.getProfileUser({
      login: req.user.login
    })
  }

  // Получение списка менеджеров по ID центра
  @HttpCode(HttpStatus.OK)
  @Get('managers/center')
  @ApiGetManagersByCenter()
  async getManagers(
    @Req() req: RequestWithUser,
    @Query() query: GetManagersDto
  ) {
    const centerId = req.user.center_id
    return this.usersService.getManagersByCenter(centerId, query)
  }

  // Изменение информации о работнике по ID
  @UseGuards(RolesGuard)
  // @Roles(RoleType.admin)
  @HttpCode(HttpStatus.OK)
  @Put('managers/:id')
  @ApiUpdateEmployee()
  async updateEmployee(
    @Param('id') employeeId: number,
    @Body() updateData: { full_name?: string; iin?: string; phone?: string },
    @Req() req
  ) {
    return this.usersService.updateEmployeeById(
      employeeId,
      updateData,
      req.user
    )
  }

  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @Get('managers/:id')
  async getManagerById(@Param('id') id: number) {
    return this.usersService.getManager(id)
  }
  @Get('openapi')
  getJsonSpec(@Res() res: Response) {
    const filePath = path.resolve('./swagger-spec.json')
    res.download(filePath, 'swagger-spec.json')
  }
}
