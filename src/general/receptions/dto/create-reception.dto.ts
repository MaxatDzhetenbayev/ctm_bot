import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, MaxLength, MinLength } from "class-validator";

export class CreateReceptionDto {
  date: string;
  time: string;
  manager_id: number;
  user_id: number;
  status: string;

}



export class createOffLineReceptionDto {
  @IsNotEmpty({ message: 'Выбор типа пользователя обязательно' })
  visitor_type_id: number

  @MinLength(6, { message: 'Поле ФИО должно содержать минимум 6 символов' })
  full_name: string

  @IsNotEmpty({ message: 'Заполнение Поля ИИН обязательно' })
  @MinLength(12, { message: 'ИИН должен содержать минимум 12 символов' })
  @MaxLength(12, { message: 'ИИН должен содержать максимум 12 символов' })
  iin: string

  @IsNotEmpty({ message: 'Заполнение поля телефона обязательно' })
  @IsPhoneNumber('KZ', { message: 'Принмаются только Казахстанские номера' })
  phone: string

  @IsNotEmpty({ message: 'Должен быть выбран сервис' })
  service_id: number
}