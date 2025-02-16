import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '../general/auth/jwt.strategy'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET || 'secret',
        signOptions: { expiresIn: '1h' }
      })
    })
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy]
})
export class JwtConfigModule {
}
