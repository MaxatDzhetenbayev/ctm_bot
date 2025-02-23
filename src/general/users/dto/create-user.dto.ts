import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { AuthType } from '../entities/user.entity'
import { RoleType } from '../entities/role.entity'

class ProfileDto {
  @IsString()
  @MinLength(2)
  full_name: string

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(12)
  iin?: string

  @IsOptional()
  @IsPhoneNumber('KZ')
  phone?: string
}

export class CreateUserDto {
  @IsString()
  auth_type: AuthType

  @ValidateIf(o => o.role !== RoleType.user)
  @IsString()
  @MinLength(6)
  login: string

  @ValidateIf(o => o.role !== RoleType.user)
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ProfileDto)
  profile: ProfileDto

  @IsString()
  role: AuthType

  @ValidateIf(o => o.role === RoleType.manager)
  @IsNotEmpty({ message: 'У менеджера должен быть стол' })
  @IsNumber()
  table: number

  @IsNumber()
  center_id: number

  @ValidateIf(o => o.role === RoleType.manager)
  @IsNotEmpty({ message: 'У менеджера должен быть хотя бы один сервис ' })
  @IsNumber({}, { each: true })
  service_ids?: number[]
}
