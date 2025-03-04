import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtConfigModule } from "src/config/jwt-config.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UsersModule, JwtConfigModule],
})
export class AuthModule {}
