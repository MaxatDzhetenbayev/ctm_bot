import { Injectable } from "@nestjs/common";

import { AuthType } from "../users/entities/user.entity";
import { RoleType } from "../users/entities/role.entity";
import { UsersService } from "../users/users.service";

interface RegisterDto {
  auth_type: AuthType;
  role: RoleType;
  telegram_id?: string;
  login?: string;
  password?: string;
}

@Injectable()
export class AuthService {

	
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto) {
    try {
      if (registerDto.auth_type === AuthType.telegram) {
        return;
      }

      if (registerDto.auth_type === AuthType.default) {
        return;
      }
    } catch (error) {}
  }
}
