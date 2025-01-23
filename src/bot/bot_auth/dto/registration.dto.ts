import {
	IsOptional,
	IsPhoneNumber,
	IsString,
	MaxLength,
	MinLength,
 } from "class-validator";

export class RegistrationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(12)
  iin?: string;

  @IsOptional()
  @IsPhoneNumber("KZ")
  phone?: string;
}
