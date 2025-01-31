import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }
}
