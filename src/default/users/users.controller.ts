import { Controller, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { register } from "module";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

//   @Post()
//   async register() {
//     return this.usersService.createUser();
//   }
}
