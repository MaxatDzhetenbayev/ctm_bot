import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,

    private jwtService: JwtService
  ) {}

  async login(userDto: LoginDto) {
    try {
      const user = await this.validateUser(userDto)

      if (!user) {
        throw new UnauthorizedException({
          message: 'Некорректный email или пароль'
        })
      }

      const { token: access_token } = await this.generateToken(user)

      return { token: access_token }
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Некорректный email или пароль'
      })
    }
  }

  private async generateToken(user: User, options?: JwtSignOptions) {
    const payload = {
      id: user.id,
      login: user.login,
      role: user.role.name,
      center_id: user.centers[0]?.id
    }

    const result: { token: string } = {
      token: this.jwtService.sign(payload, options)
    }

    return result
  }

  private async validateUser(userDto: LoginDto) {
    const user = await this.usersService.validateUserByLogin(userDto.login)
    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password_hash ?? ''
    )

    if (user && passwordEquals) {
      return user
    }

    throw new UnauthorizedException({
      message: 'Некорректный email или пароль'
    })
  }
}
