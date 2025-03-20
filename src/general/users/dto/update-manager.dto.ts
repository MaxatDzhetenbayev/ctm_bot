import { PartialType, PickType } from '@nestjs/mapped-types'
import { CreateUserDto } from './create-user.dto'

export class UpdateManagerDto extends PartialType(
  PickType(CreateUserDto, [
    'login',
    'password',
    'profile',
    'cabinet',
    'table',
    'service_ids'
  ] as const)
) {}
