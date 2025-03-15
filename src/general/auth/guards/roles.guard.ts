import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Reflector } from '@nestjs/core'
import { RoleType } from 'src/general/users/entities/role.entity'

export interface AuthGuardConfig {
  disabled?: boolean
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = context.switchToHttp().getRequest()

    try {
      const requiredRoles = this.reflector.getAllAndOverride<
        RoleType[],
        string
      >('roles', [context.getHandler(), context.getClass()])

      if (!requiredRoles) {
        return true
      }

      const hasRole: boolean = requiredRoles.some(role => role === user.role)

      if (hasRole) {
        return hasRole
      } else {
        throw new ForbiddenException('У вас нет доступа к этому ресурсу')
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
    }
  }
}
