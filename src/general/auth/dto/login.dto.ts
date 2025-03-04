import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
}
