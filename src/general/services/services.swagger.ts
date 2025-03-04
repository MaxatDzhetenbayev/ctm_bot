import { applyDecorators } from '@nestjs/common'
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

export function ApiServicesTags() {
  return function (target: Function) {
    ApiTags('Services')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiCreateService() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать новую услугу' }),
    ApiBody({
      schema: {
        example: {
          name: {
            kz: 'Қоғамдық жұмыстар',
            ru: 'Общественные работы'
          },
          parent_id: 2
        }
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Услуга успешно создана',
      schema: {
        example: {
          id: 1,
          name: 'Консультация',
          description: 'Консультация специалиста',
          createdAt: '2025-02-18T12:00:00.000Z',
          updatedAt: '2025-02-18T12:00:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 500, description: 'Ошибка при создании услуги' })
  )
}

export function ApiFindAllServices() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить список всех услуг' }),
    ApiResponse({
      status: 200,
      description: 'Список услуг',
      schema: {
        example: [
          {
            id: 1,
            name: {
              kz: 'Жұмыссыз ретінде тіркелу және тұрақты жұмысқа орналасу',
              ru: 'Регистрация и трудоустройство безработных'
            },
            children: []
          },
          {
            id: 2,
            name: {
              kz: 'Субсидияланатын жұмыс орындары',
              ru: 'Субсидированные рабочие места'
            },
            children: [
              {
                id: 3,
                name: { kz: 'Қоғамдық жұмыстар', ru: 'Общественные работы' },
                children: []
              },
              {
                id: 4,
                name: { kz: 'Әлеуметтік жұмыстар', ru: 'Социальные работы' },
                children: []
              },
              {
                id: 5,
                name: {
                  kz: '«Күміс жас» жобасы',
                  ru: 'Программа «Серебряный возраст»'
                },
                children: []
              },
              {
                id: 6,
                name: { kz: 'Жастар практикасы', ru: 'Молодежная практика' },
                children: []
              },
              {
                id: 7,
                name: {
                  kz: 'Мүгедектігі бар адамдарға',
                  ru: 'Лицам с ограниченными возможностями'
                },
                children: []
              }
            ]
          },
          {
            id: 8,
            name: {
              kz: 'Қысқа мерзімді кәсіптік оқыту',
              ru: 'Краткосрочное профессиональное обучение'
            },
            children: []
          },
          { id: 9, name: { kz: 'Көші-қон', ru: 'Миграция' }, children: [] },
          {
            id: 10,
            name: {
              kz: 'Халықтың әлеуметтік осал тобын қолдау үшін жаңа бизнес-идеяларды іске асыруға берілетін 400 АЕК көлемінде қайтарымсыз гранттар',
              ru: '400 безвозвратных грантов на реализацию новых бизнес-идей для поддержки общественных молодежных объединений'
            },
            children: []
          },
          {
            id: 11,
            name: {
              kz: 'Атаулы әлеуметтік көмек',
              ru: 'Специальная социальная помощь'
            },
            children: []
          }
        ]
      }
    })
  )
}

export function ApiFindServiceById() {
  return applyDecorators(
    ApiOperation({ summary: 'Получить информацию об услуге по ID' }),
    ApiParam({ name: 'id', type: Number, description: 'ID услуги' }),
    ApiResponse({
      status: 200,
      description: 'Информация об услуге',
      schema: {
        example: {
          id: 2,
          name: {
            kz: 'Субсидияланатын жұмыс орындары',
            ru: 'Субсидированные рабочие места'
          },
          children: [
            {
              id: 3,
              name: { kz: 'Қоғамдық жұмыстар', ru: 'Общественные работы' }
            },
            {
              id: 4,
              name: { kz: 'Әлеуметтік жұмыстар', ru: 'Социальные работы' }
            },
            {
              id: 5,
              name: {
                kz: '«Күміс жас» жобасы',
                ru: 'Программа «Серебряный возраст»'
              }
            },
            {
              id: 6,
              name: { kz: 'Жастар практикасы', ru: 'Молодежная практика' }
            },
            {
              id: 7,
              name: {
                kz: 'Мүгедектігі бар адамдарға',
                ru: 'Лицам с ограниченными возможностями'
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Услуга не найдена' })
  )
}

export function ApiUpdateService() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить информацию об услуге' }),
    ApiParam({ name: 'id', type: Number, description: 'ID услуги' }),
    ApiResponse({
      status: 200,
      description: 'Услуга успешно обновлена',
      schema: {
        example: {
          id: 1,
          name: 'Консультация',
          description: 'Обновленная консультация специалиста',
          createdAt: '2025-02-18T12:00:00.000Z',
          updatedAt: '2025-02-19T12:00:00.000Z'
        }
      }
    }),
    ApiResponse({ status: 404, description: 'Услуга не найдена' }),
    ApiResponse({ status: 500, description: 'Ошибка при обновлении услуги' })
  )
}

export function ApiDeleteService() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить услугу' }),
    ApiParam({ name: 'id', type: Number, description: 'ID услуги' }),
    ApiResponse({
      status: 200,
      description: 'Услуга успешно удалена',
      schema: {
        example: { message: 'Услуга удалена' }
      }
    }),
    ApiResponse({ status: 404, description: 'Услуга не найдена' }),
    ApiResponse({ status: 500, description: 'Ошибка при удалении услуги' })
  )
}
