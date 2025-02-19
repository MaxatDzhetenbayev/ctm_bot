import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log('Cookies:', request.cookies)
          return request?.cookies?.access_token || null
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: 'secret'
    })
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token')
    }
    console.log('JwtStrategy.validate() called:', payload)
    return {
      id: payload.id,
      login: payload.login,
      role: payload.role,
      center_id: payload.center_id
    }
  }
}
