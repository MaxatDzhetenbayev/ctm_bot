import { Type } from "class-transformer";
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

class ProfileDto {
  @IsString()
  @MaxLength(12)
  @MinLength(12)
  iin: string;

  @IsString()
  @MinLength(2)
  full_name: string;

  @IsPhoneNumber("KZ")
  phone: string;
}

export class CreateUserDto {
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @IsNumber()
  role: number;

  @IsNumber()
  center_id: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  service_ids?: number[];
}
