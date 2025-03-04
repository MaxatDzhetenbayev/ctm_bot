import { RoleType } from "../entities/role.entity";
import { AuthType } from "../entities/user.entity";

export interface CreateUserByTelegramDto {
  auth_type: AuthType;
  telegram_id: string;
  role?: RoleType;
  iin: string;
  full_name: string;
  phone: string;
}
