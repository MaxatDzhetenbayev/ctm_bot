import { applyDecorators } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

export function ApiReceptionsTags() {
  return function (target: Function) {
    ApiTags('Receptions')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiCreateReception() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать прием и назначить менеджера' }),
    ApiResponse({
      status: 201,
      description: 'Прием успешно создан',
      schema: {
        example: {
          reception: {
            id: 1,
            date: '2025-02-18',
            time: '10:30',
            rating: null
          },
          profile: {
            iin: '123456789012',
            full_name: 'Иван Иванов',
            phone: '+77001234567'
          },
          table: 'Кабинет 12',
          center: 'Центр обслуживания',
          service: 'Консультация'
        }
      }
    }),
    ApiResponse({ status: 500, description: 'Ошибка при создании приема' })
  )
}

export function ApiFindAllReceptions() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список приемов для менеджера' }),
    ApiResponse({
      status: 200,
      description: 'Список приемов',
      schema: {
        example: [
          {
            id: 1,
            date: '2025-02-18',
            time: '10:30',
            rating: 4,
            user: {
              id: 3,
              profile: {
                iin: '123456789012',
                full_name: 'Иван Иванов',
                phone: '+77001234567'
              }
            },
            status: { name: 'Завершен' }
          }
        ]
      }
    })
  )
}

export function ApiFindReceptionById() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить информацию о конкретном приеме' }),
    ApiParam({ name: 'id', type: Number, description: 'ID приема' }),
    ApiResponse({
      status: 200,
      description: 'Данные о приеме',
      schema: {
        example: {
          id: 1,
          date: '2025-02-18',
          time: '10:30',
          rating: 4,
          user: {
            id: 3,
            profile: {
              iin: '123456789012',
              full_name: 'Иван Иванов',
              phone: '+77001234567'
            }
          },
          status: { name: 'Завершен' },
          service: { name: 'Консультация' }
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Прием не найден' })
  )
}

export function ApiChangeReceptionStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Изменить статус приема' }),
    ApiParam({ name: 'id', type: Number, description: 'ID приема' }),
    ApiQuery({ name: 'status', type: Number, description: 'Новый ID статуса' }),
    ApiResponse({
      status: 200,
      description: 'Статус приема успешно изменен',
      schema: {
        example: {
          id: 1,
          date: '2025-02-18',
          time: '10:30',
          rating: 4,
          status_id: 2
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Прием не найден' }),
    ApiResponse({ status: 500, description: 'Ошибка при изменении статуса' })
  )
}

export function ApiFindFreeTimeSlots() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить свободные временные слоты для приема'
    }),
    ApiQuery({ name: 'centerId', type: Number, description: 'ID центра' }),
    ApiQuery({ name: 'serviceId', type: Number, description: 'ID услуги' }),
    ApiQuery({
      name: 'date',
      type: String,
      description: 'Дата в формате YYYY-MM-DD'
    }),
    ApiResponse({
      status: 200,
      description: 'Список свободных временных слотов',
      schema: {
        example: ['09:00', '09:30', '10:00']
      }
    })
  )
}
