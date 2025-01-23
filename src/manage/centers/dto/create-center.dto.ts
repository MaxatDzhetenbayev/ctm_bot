import { IsNotEmpty, IsObject } from "class-validator";

export class CreateCenterDto {
  @IsNotEmpty()
  @IsObject()
  name: {
    [lang: string]: string;
  };
}
