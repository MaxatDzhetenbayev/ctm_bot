import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/guards/roles.decorator";
import { RoleType } from "./entities/role.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(RoleType.admin)
  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }
}
