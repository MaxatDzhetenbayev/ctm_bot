import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RoleType } from 'src/general/users/entities/role.entity'

interface RequestWithUser extends Request {
  user: { id: number; login: string; role: string; center_id: number }
  params: { id?: string; centerId?: string }
}

export const CurrentUserInfo = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest()
    const { user, params } = request

    if (user.role === RoleType.manager) {
      return { managerId: user.id }
    }

    if (user.role === RoleType.admin) {
      return { centerId: user.center_id }
    }

    if (user.role === RoleType.superadmin) {
      return { centerId: params.id }
    }
  }
)
