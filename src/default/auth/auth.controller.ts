import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //   @HttpCode(HttpStatus.OK)
  //   @Post("login")
  //   async login(@Body() loginDto: LoginDto) {
  //     const user = await this.authService.validateUser(loginDto);

  //     if (!user) {
  //       throw new UnauthorizedException("Invalid credentials");
  //     }

  //     return this.authService.login(user);
  //   }

  //   @Post("register")
  //   async register(@Body() body: FullUserDto) {
  //     return this.authService.register(body);
  //   }
}
