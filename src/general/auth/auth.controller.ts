import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
    try {
      const { token } = await this.authService.login(loginDto)
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      })
      return { status: 200, message: 'Вы успешно авторизованы' }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException('Ошибка при авторизации')
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token')
    return { status: 200, message: 'Вы успешно разлогинились' }
  }
}
