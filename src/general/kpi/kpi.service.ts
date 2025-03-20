import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as moment from 'moment'
import { FindOptions, Op, cast, col, fn, literal } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { Reception } from 'src/general/receptions/entities/reception.entity'

@Injectable()
export class KpiService {
  constructor(
    @InjectModel(Reception)
    private readonly receptionRepository: typeof Reception
  ) { }

  private getLastWeekdays(startDate: moment.Moment): moment.Moment[] {
    const weekdays = []
    let currentDate = startDate
    while (weekdays.length < 5) {
      if (currentDate.day() !== 6 && currentDate.day() !== 0) {
        weekdays.push(currentDate.clone())
      }
      currentDate.subtract(1, 'day')
    }

    return weekdays.reverse()
  }

  async getReceptionsPerWeekday({
    centerId,
    managerId
  }: {
    managerId?: number
    centerId?: number
  }) {
    moment.locale('ru')
    const today = moment()
    const dates = this.getLastWeekdays(today)
    const options: FindOptions = {
      attributes: [
        'date',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        date: { [Op.in]: dates.map(day => day.format('YYYY-MM-DD')) },
        status_id: 4
      },
      group: ['date'],
      raw: true
    }
    if (centerId) {
      options.where['center_id'] = centerId
    } else {
      options.where['manager_id'] = managerId
    }

    const receptions = (await this.receptionRepository.findAll({
      ...options
    })) as unknown as { date: string; count: number }[]
    const result = receptions.reduce(
      (acc, { date, count }) => ({
        ...acc,
        [moment(date).format('dd')]: Number(count)
      }),
      Object.fromEntries(dates.map(day => [day.format('dd'), 0]))
    )

    return result
  }

  async getTodaySummary({
    centerId,
    managerId
  }: {
    managerId?: number
    centerId?: number
  }) {
    const today = moment().format('YYYY-MM-DD')

    const groupObject = managerId ? 'manager_id' : 'center_id'

    const options: FindOptions = {
      attributes: [
        [
          fn(
            'COALESCE',
            fn(
              'COUNT',
              literal('CASE WHEN status_id = 4 THEN 1 ELSE NULL END')
            ),
            0
          ),
          'completedReceptionsCount'
        ],
        [
          fn(
            'COALESCE',
            fn('ROUND', fn('AVG', cast(col('rating'), 'DECIMAL')), 1),
            0
          ),
          'averageRating'
        ],
        [
          fn(
            'COALESCE',
            fn('COUNT', literal('CASE WHEN rating < 4 THEN 1 ELSE NULL END')),
            0
          ),
          'problematicRate'
        ],
        [
          fn(
            'COALESCE',
            fn('ROUND', literal('(COUNT(*) * 1.0 / 32) * 100'), 1),
            0
          ),
          'managerLoad'
        ]
      ],

      where: {
        date: today
      },
      group: [groupObject]
    }

    if (centerId) {
      options.where['center_id'] = centerId
    } else {
      options.where['manager_id'] = managerId
    }

    const receptions = await this.receptionRepository.findOne({
      ...options
    })

    return receptions
  }
}
