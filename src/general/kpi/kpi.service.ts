import { Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { InjectModel } from '@nestjs/sequelize'
import { Reception } from 'src/general/receptions/entities/reception.entity'
import { Op } from 'sequelize'

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

  async getReceptionStatsPerWeekday(managerId: number): Promise<{
    total: number;
    completed: number;
    declined: number;
  }> {
    const today = moment()
    const lastFiveWeekdays = this.getLastWeekdays(today)

    const dates = lastFiveWeekdays.map((day) => day.format('YYYY-MM-DD'))

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: dates
      }
    })

    const total = receptions.length
    const completed = receptions.filter((reception) => reception.status_id === 4).length
    const declined = receptions.filter((reception) => reception.status_id === 5).length

    return {
      total,
      completed,
      declined
    }
  }

  // Метрика 1: Общее число обслуженных клиентов за день
  async getTotalReceptionsToday(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: today,
        status_id: 4
      }
    })

    return receptions.length
  }

  // Метрика 2: Доля проблемных записей
  async getProblematicReceptionsRate(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    // Получаем записи за сегодняшний день, которые либо отменены, либо имеют рейтинг ниже 3
    const problematicReceptions = await this.receptionRepository.count({
      where: {
        manager_id: managerId,
        date: today,
        [Op.or]: [
          { status_id: 5 }, // Статус 5 - "отменённые"
          { rating: { [Op.lt]: 3 } } // Рейтинг ниже 3
        ]
      }
    })

    return problematicReceptions
  }

  // Метрика 3: Средний рейтинг удовлетворенности клиентов
  async getAverageClientRating(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: today,
        rating: { [Op.ne]: null }
      }
    })

    if (receptions.length === 0) return 0

    const totalRating = receptions.reduce((sum, reception) => sum + reception.rating, 0)

    return totalRating / receptions.length
  }

  // Метрика 4: Средняя загруженность менеджера в день
  async getManagerLoadToday(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: today,
        status_id: { [Op.ne]: 5 }
      }
    })

    const load = receptions.length
    const maxDailyLoad = 32

    return (load / maxDailyLoad) * 100
  }
}