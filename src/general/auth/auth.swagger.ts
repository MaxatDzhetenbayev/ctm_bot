import { applyDecorators } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { LoginDto } from './dto/login.dto'

export function ApiAuthTags() {
  return function (target: Function) {
    ApiTags('Auth')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Авторизация пользователя (вход в систему)' }),
    ApiBody({
      type: LoginDto,
      description: 'Данные пользователя для входа',
      examples: {
        example1: {
          summary: 'Пример входа администратора',
          value: {
            login: 'admin',
            password: 'securepassword123'
          }
        },
        example2: {
          summary: 'Пример входа менеджера',
          value: {
            login: 'manager123',
            password: 'managerpassword'
          }
        }
      }
    }),
    ApiResponse({
      status: 200,
      description: 'Пользователь успешно авторизован',
      schema: {
        example: {
          status: 200,
          message: 'Вы успешно авторизованы',
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }),
    ApiResponse({
      status: 401,
      description: 'Некорректный email или пароль',
      schema: {
        example: {
          statusCode: 401,
          message: 'Некорректный email или пароль'
        }
      }
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при авторизации',
      schema: {
        example: {
          statusCode: 500,
          message: 'Ошибка при авторизации'
        }
      }
    })
  )
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Выход из системы (удаление access_token)' }),
    ApiHeader({
      name: 'Cookie',
      description: 'Access token, полученный при авторизации',
      required: true,
      example: 'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    ApiResponse({
      status: 200,
      description: 'Пользователь успешно разлогинился',
      schema: {
        example: {
          status: 200,
          message: 'Вы успешно разлогинились'
        }
      }
    })
  )
}
