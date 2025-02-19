import { applyDecorators } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { CreateUserDto } from './dto/create-user.dto'

export function ApiUsersTags() {
  return function (target: Function) {
    ApiTags('Users')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать нового пользователя' }),
    ApiBody({
      type: CreateUserDto,
      examples: {
        example1: {
          summary: 'Создание пользователя с ролью admin',
          value: {
            login: 'user',
            password: 'password',
            profile: {
              iin: '012345678910',
              full_name: 'Админ Админов Админович',
              phone: '+77777777777'
            },
            role: 2,
            center_id: 1
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Пользователь успешно создан',
      schema: {
        example: {
          id: 1,
          login: 'admin',
          role_id: 2,
          auth_type: 'default'
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации или недостаточно прав'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при создании пользователя'
    })
  )
}

export function ApiGetProfile() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить профиль авторизованного пользователя' }),
    ApiResponse({
      status: 200,
      description: 'Информация о пользователе',
      schema: {
        example: {
          userLogin: 'admin',
          role: 'admin',
          full_name: 'Иванов Иван Иванович'
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Пользователь или профиль не найден'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при получении профиля'
    })
  )
}

export function ApiCreateManager() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать нового менеджера' }),
    ApiBody({
      type: CreateUserDto,
      examples: {
        example1: {
          summary: 'Создание пользователя',
          value: {
            login: 'user123',
            password: 'password123',
            role: 3,
            center_id: 7,
            profile: {
              full_name: 'Айдос Касымов',
              iin: '940123456789',
              phone: '+77050001122'
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Менеджер успешно создан',
      schema: {
        example: {
          id: 5,
          login: 'manager123',
          role_id: 2,
          auth_type: 'default'
        }
      }
    }),
    ApiResponse({
      status: 400,
      description: 'У вас нет прав на создание менеджера'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при создании менеджера'
    })
  )
}

export function ApiGetManagersByCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список менеджеров по ID центра' }),
    ApiResponse({
      status: 200,
      description: 'Список менеджеров центра',
      schema: {
        example: [
          {
            id: 101,
            full_name: 'Иванов Иван Иванович',
            iin: '123456789012',
            phone: '+7 777 123 45 67'
          },
          {
            id: 102,
            full_name: 'Петров Петр Петрович',
            iin: '987654321098',
            phone: '+7 777 987 65 43'
          }
        ]
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Менеджеры не найдены'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при получении менеджеров'
    })
  )
}

export function ApiSearchManager() {
  return applyDecorators(
    ApiOperation({ summary: 'Поиск работника по ФИО' }),
    ApiQuery({
      name: 'full_name',
      type: String,
      description: 'Полное имя сотрудника',
      required: true
    }),
    ApiResponse({
      status: 200,
      description: 'Список найденных сотрудников',
      schema: {
        example: [
          {
            id: 101,
            full_name: 'Иванов Иван Иванович',
            iin: '123456789012',
            phone: '+7 777 123 45 67'
          }
        ]
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Сотрудник не найден'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при поиске сотрудника'
    })
  )
}

export function ApiUpdateEmployee() {
  return applyDecorators(
    ApiOperation({ summary: 'Изменить информацию о работнике по ID' }),
    ApiParam({ name: 'id', type: Number, description: 'ID работника' }),
    ApiBody({
      schema: {
        example: {
          full_name: 'Новиков Сергей Павлович',
          iin: '112233445566',
          phone: '+7 777 112 33 44'
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Работник успешно обновлён',
      schema: {
        example: {
          id: 101,
          full_name: 'Новиков Сергей Павлович',
          iin: '112233445566',
          phone: '+7 777 112 33 44'
        }
      }
    }),
    ApiResponse({
      status: 404,
      description: 'Работник не найден или не относится к вашему центру'
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при обновлении информации о работнике'
    })
  )
}
