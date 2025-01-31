import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("/login")
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
    try {
      const { token } = await this.authService.login(loginDto);
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: true, // false
        sameSite: "strict", // None
      });
      return { status: 200, message: "Вы успешно авторизованы" };
    } catch (error) {
      throw new InternalServerErrorException("Ошибка при авторизации");
    }
  }
}
