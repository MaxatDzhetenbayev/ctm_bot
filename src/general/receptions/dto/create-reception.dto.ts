import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreateReceptionDto {
  date: string;
  time: string;
  manager_id: number;
  user_id: number;
  status: string;

}



export class createOffLineReceptionDto {
  @IsNotEmpty()
  @IsNumber()
  visitor_type_id: number

  @IsString()
  @MinLength(2)
  full_name: string

  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  @MaxLength(12)
  iin: string

  @IsNotEmpty()
  @IsPhoneNumber('KZ')
  @IsString()
  phone: string

  @IsNotEmpty({ message: 'Должен быть выбран один сервис' })
  @IsNumber()
  service_id: number
}