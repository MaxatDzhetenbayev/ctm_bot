import { RoleType } from "../entities/role.entity";
import { AuthType } from "../entities/user.entity";

export interface CreateUserDto {
  auth_type: AuthType;
  telegram_id?: string;
  login?: string;
  password?: string;

  role?: RoleType;

  iin: string;
  full_name: string;
  phone: string;
}
