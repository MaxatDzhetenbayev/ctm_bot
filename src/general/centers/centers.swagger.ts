import { applyDecorators } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'
import { CreateCenterDto } from './dto/create-center.dto'
import { UpdateCenterDto } from './dto/update-center.dto'
import { Center } from './entities/center.entity'

export function ApiCentersTag() {
  return function (target: Function) {
    ApiTags('Centers')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiCreateCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать новый центр' }),
    ApiBody({
      type: CreateCenterDto,
      examples: {
        example1: {
          summary: 'Пример создания центра',
          value: {
            name: {
              kz: 'Семей қаласының мансап орталығы',
              ru: 'Центр карьеры города Семей'
            }
          }
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Центр успешно создан',
      type: Center
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при создании центра'
    })
  )
}

export function ApiFindAllCenters() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список всех центров' }),
    ApiResponse({
      status: 200,
      description: 'Массив объектов центров',
      type: [Center],
      example: [
        {
          id: 1,
          name: {
            kz: 'Семей қаласының мансап орталығы',
            ru: 'Карьерный центр города Семей'
          }
        },
        {
          id: 7,
          name: {
            kz: 'Алматы қаласының мансап орталығы',
            ru: 'Карьерный центр города Алматы'
          }
        }
      ]
    }),
    ApiResponse({
      status: 500,
      description: 'Ошибка при получении центров'
    })
  )
}

export function ApiFindOneCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить информацию о конкретном центре (TODO)' }),
    ApiParam({ name: 'id', type: Number, description: 'ID центра' }),
    ApiResponse({
      status: 200,
      description: 'Объект центра',
      type: Center
    }),
    ApiResponse({ status: 404, description: 'Центр не найден' })
  )
}

export function ApiUpdateCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить информацию о центре (TODO)' }),
    ApiParam({ name: 'id', type: Number, description: 'ID центра' }),
    ApiBody({ type: UpdateCenterDto }),
    ApiResponse({
      status: 200,
      description: 'Центр успешно обновлён'
    }),
    ApiResponse({ status: 404, description: 'Центр не найден' })
  )
}

export function ApiDeleteCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить центр' }),
    ApiParam({ name: 'id', type: Number, description: 'ID центра' }),
    ApiResponse({ status: 200, description: 'Центр успешно удалён' }),
    ApiResponse({ status: 404, description: 'Центр не найден' })
  )
}
