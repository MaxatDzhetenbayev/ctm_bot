import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NextFunction, Request, Response } from 'express'

interface CustomRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {
  }

  use(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.cookies['access_token']
    if (!token) {
      return res.status(401).send({ message: 'Вы не авторизованы' })
    }
    try {
      const decoded = this.jwtService.verify(token, { secret: 'secret' })
      req.user = decoded
      // console.log('Token decoded successfully', decoded)
      next()
    } catch (err) {
      // console.log('Token verification failed', err.message)
      return res.status(401).send({
        message: 'Вы не авторизованы'
      })
    }
  }
}
