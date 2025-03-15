import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common'
import { RoleType } from 'src/general/users/entities/role.entity'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string; center_id: number }
  params: { id?: string }
}

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest()
    const { user, params } = request

    if (user.role === RoleType.manager) {
      return user.id
    }

    if (!params.id) {
      throw new ForbiddenException('ID пользователя не указан')
    }

    return Number(params.id)
  }
)
