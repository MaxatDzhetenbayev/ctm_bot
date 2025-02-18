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
  UseGuards
} from '@nestjs/common'
import { Roles } from '../auth/guards/roles.decorator'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CreateUserDto } from './dto/create-user.dto'
import { RoleType } from './entities/role.entity'
import { UsersService } from './users.service'
import {
  ApiCreateManager,
  ApiCreateUser,
  ApiGetManagersByCenter,
  ApiGetProfile,
  ApiSearchManager,
  ApiUpdateEmployee,
  ApiUsersTags
} from './users.swagger'

@ApiUsersTags()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(RoleType.admin)
  @Post()
  @ApiCreateUser()
  async create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body)
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  @ApiGetProfile()
  async getProfile(@Req() req) {
    return this.usersService.getProfileUser({
      login: req.user.login
    })
  }

  // Создание менеджера
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  // @Roles(RoleType.admin) // Только админы могут создавать сотрудников
  @Post('manager')
  @ApiCreateManager()
  async createEmployee(@Body() body: CreateUserDto, @Req() req) {
    return this.usersService.createManager(body, req.user)
  }

  // Получение списка менеджеров по ID центра
  @HttpCode(HttpStatus.OK)
  @Get('managers/center/:centerId')
  @ApiGetManagersByCenter()
  async getManagers(@Req() req, @Param('centerId') centerId: number) {
    return this.usersService.getManagersByCenter(centerId)
  }

  // Поиск работника по ФИО
  @UseGuards(RolesGuard)
  // @Roles(RoleType.admin)
  @HttpCode(HttpStatus.OK)
  @Get('managers/search')
  @ApiSearchManager()
  async searchManager(@Query('full_name') fullName: string, @Req() req) {
    return this.usersService.getEmployeeByFullName(fullName, req.user)
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
}
