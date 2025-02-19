import { applyDecorators } from '@nestjs/common'
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger'

export function ApiKpiTags() {
  return function (target: Function) {
    ApiTags('KPI')(target)
    ApiCookieAuth('access_token')(target)
  }
}

export function ApiFindLastWeekday() {
  return applyDecorators(
    ApiOperation({
      summary: 'Количество завершенных приемов за последние 5 будних дней'
    }),
    ApiResponse({
      status: 200,
      description:
        'Объект с завершенными приемами по дням недели в обратном порядке',
      schema: { example: { ср: 0, чт: 1, пт: 2, пн: 3, вт: 1 } }
    })
  )
}

export function ApiFindLastWeekdayById() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Количество завершенных приемов по manager_id за последние 5 будних дней'
    }),
    ApiParam({ name: 'id', type: Number, description: 'ID менеджера' }),
    ApiResponse({
      status: 200,
      description: 'Объект с завершенными приемами по дням недели',
      schema: { example: { '18': [3, 2, 1, 0, 0] } }
    })
  )
}

export function ApiFindLastWeekdayByCenter() {
  return applyDecorators(
    ApiOperation({
      summary: 'Количество завершенных приемов за неделю (пн-пт) по ID центра'
    }),
    ApiParam({ name: 'centerId', type: Number, description: 'ID центра' }),
    ApiResponse({
      status: 200,
      description: 'Объект с завершенными приемами по дням недели',
      schema: { example: { пт: 2, пн: 3, вт: 1, ср: 0, чт: 0 } }
    })
  )
}

export function ApiGetStats() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Статистика приемов за неделю (пн-пт) для авторизованного менеджера'
    }),
    ApiResponse({
      status: 200,
      description: 'Общее количество, завершенные, отказанные приемы',
      schema: { example: { total: 8, completed: 8, declined: 0 } }
    })
  )
}

export function ApiGetStatsByCenter() {
  return applyDecorators(
    ApiOperation({
      summary: 'Статистика приемов за неделю (пн-пт) для всех менеджеров центра'
    }),
    ApiParam({ name: 'centerId', type: Number, description: 'ID центра' }),
    ApiResponse({
      status: 200,
      description: 'Объект с manager_id как ключом и статистикой по 5 дням',
      schema: {
        example: { total: 8, completed: 7, declined: 0 }
      }
    })
  )
}

export function ApiGetSummary() {
  return applyDecorators(
    ApiOperation({ summary: 'Метрики за день для авторизованного менеджера' }),
    ApiResponse({
      status: 200,
      description: 'Объект с общими показателями за день',
      schema: {
        example: {
          totalReceptions: 0,
          problematicRate: 0,
          averageRating: 0,
          managerLoad: 0
        }
      }
    })
  )
}

export function ApiGetSummaryById() {
  return applyDecorators(
    ApiOperation({ summary: 'Метрики за день по ID менеджера' }),
    ApiParam({ name: 'id', type: Number, description: 'ID менеджера' }),
    ApiResponse({
      status: 200,
      description: 'Объект с общими показателями за день',
      schema: {
        example: {
          totalReceptions: 0,
          problematicRate: 0,
          averageRating: 0,
          managerLoad: 0
        }
      }
    })
  )
}

export function ApiGetDailySummaryByCenter() {
  return applyDecorators(
    ApiOperation({ summary: 'Метрики за день для всех менеджеров центра' }),
    ApiParam({ name: 'centerId', type: Number, description: 'ID центра' }),
    ApiResponse({
      status: 200,
      description: 'Объект с manager_id как ключом и показателями за день',
      schema: {
        example: {
          totalReceptions: 0,
          problematicRate: 0,
          averageRating: 0,
          managerLoad: 0
        }
      }
    })
  )
}
