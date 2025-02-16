import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { InjectModel } from '@nestjs/sequelize'
import { Reception } from 'src/general/receptions/entities/reception.entity'

@Injectable()
export class KpiService {
  constructor(
    @InjectModel(Reception)
    private readonly receptionRepository: typeof Reception
  ) {
  }

  private getLastWeekdays(startDate: moment.Moment): moment.Moment[] {
    const weekdays = []
    let currentDate = startDate.clone().subtract(1, 'day')

    while (weekdays.length < 5) {
      if (currentDate.day() !== 6 && currentDate.day() !== 0) {
        weekdays.push(currentDate.clone())
      }
      currentDate.subtract(1, 'day')
    }

    return weekdays
  }

  async getReceptionsPerWeekday(managerId: number): Promise<number[]> {
    const today = moment()
    const lastFiveWeekdays = this.getLastWeekdays(today)

    const dates = lastFiveWeekdays.map((day) => day.format('YYYY-MM-DD'))

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: dates,
        status_id: 4
      }
    })

    const counts = lastFiveWeekdays.map((day) => {
      const date = day.format('YYYY-MM-DD')
      return receptions.filter((reception) =>
        moment(reception.date).isSame(date, 'day')
      ).length
    })

    return counts
  }
}