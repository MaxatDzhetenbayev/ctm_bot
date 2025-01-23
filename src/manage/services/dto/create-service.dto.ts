import { IsNotEmpty, IsNumber, IsObject, IsOptional } from "class-validator";

export class CreateServiceDto {
  @IsNotEmpty()
  @IsObject()
  name: Record<string, string>;

  @IsOptional()
  @IsNumber()
  parent_id: number;
}
