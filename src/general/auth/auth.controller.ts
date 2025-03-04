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
import { ApiAuthTags, ApiLogin, ApiLogout } from './auth.swagger'
import { LoginDto } from './dto/login.dto'

@ApiAuthTags()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @ApiLogin()
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res) {
    const domain = process.env.COOKIE_DOMAIN || 'localhost'
    try {
      const { token } = await this.authService.login(loginDto)
      res.cookie('access_token', token, {
        path: '/',
        domain: domain,
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
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
  @ApiLogout()
  async logout(@Res({ passthrough: true }) res) {
    res.clearCookie('access_token')
    return { status: 200, message: 'Вы успешно разлогинились' }
  }
}
