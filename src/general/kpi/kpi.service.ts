import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import * as moment from 'moment'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { Reception } from 'src/general/receptions/entities/reception.entity'
import { ManagerTable } from 'src/general/users/entities/manager-table.entity'

@Injectable()
export class KpiService {
  constructor(
    @InjectModel(Reception)
    private readonly receptionRepository: typeof Reception,

    @InjectModel(ManagerTable)
    private readonly managersRepository: typeof ManagerTable
  ) {}

  private getLastWeekdays(startDate: moment.Moment): moment.Moment[] {
    const weekdays = []
    let currentDate = startDate.clone().subtract(1, 'day')

    while (weekdays.length < 5) {
      if (currentDate.day() !== 6 && currentDate.day() !== 0) {
        weekdays.push(currentDate.clone())
      }
      currentDate.subtract(1, 'day')
    }

    return weekdays.reverse()
  }

  async getReceptionsPerWeekday(managerId: number) {
    moment.locale('ru')
    const today = moment()
    const dates = this.getLastWeekdays(today)

    const receptions = (await this.receptionRepository.findAll({
      attributes: [
        'date',
        [Sequelize.fn('COUNT', Sequelize.col('*')), 'count']
      ],
      where: {
        manager_id: managerId,
        date: { [Op.in]: dates.map(day => day.format('YYYY-MM-DD')) },
        status_id: 4
      },
      group: ['date'],
      raw: true
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

  async getReceptionStatsPerWeekday(managerId: number) {
    const today = moment().add(1, 'days')
    const lastFiveWeekdays = this.getLastWeekdays(today)
    const dates = lastFiveWeekdays.map(day => day.format('YYYY-MM-DD'))
    // console.log(dates)
    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: { [Op.in]: dates }
      }
    })

    return {
      total: receptions.length,
      completed: receptions.filter(reception => reception.status_id === 4)
        .length,
      declined: receptions.filter(reception => reception.status_id === 5).length
    }
  }

  async getTotalReceptionsToday(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')
    // console.log(today)
    return await this.receptionRepository.count({
      where: {
        manager_id: managerId,
        date: today,
        status_id: 4
      }
    })
  }

  async getProblematicReceptionsRate(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    return await this.receptionRepository.count({
      where: {
        manager_id: managerId,
        date: today,
        [Op.or]: [{ status_id: 5 }, { rating: { [Op.lt]: 3 } }]
      }
    })
  }

  async getAverageClientRating(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: managerId,
        date: today,
        rating: { [Op.ne]: null }
      },
      attributes: ['rating']
    })

    if (receptions.length === 0) return 0

    const totalRating = receptions.reduce(
      (sum, reception) => sum + reception.rating,
      0
    )
    return totalRating / receptions.length
  }

  async getManagerLoadToday(managerId: number): Promise<number> {
    const today = moment().format('YYYY-MM-DD')
    const maxDailyLoad = 32

    const load = await this.receptionRepository.count({
      where: {
        manager_id: managerId,
        date: today,
        status_id: { [Op.ne]: 5 }
      }
    })

    return (load / maxDailyLoad) * 100
  }

  async getReceptionsPerWeekdayByCenter(
    centerId: number
  ): Promise<Record<number, Record<string, number>>> {
    moment.locale('ru')
    const today = moment().add(1, 'days')
    const lastFiveWeekdays = this.getLastWeekdays(today)

    const dates = lastFiveWeekdays
      .map(day => day.format('YYYY-MM-DD'))
      .reverse()
    const weekdays = lastFiveWeekdays.map(day => day.format('dd')).reverse()

    const managers = await this.managersRepository.findAll({
      where: { center_id: centerId },
      attributes: ['manager_id']
    })

    const managerIds = managers.map(manager => manager.manager_id)

    if (managerIds.length === 0) {
      return {}
    }

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: { [Op.in]: managerIds },
        date: { [Op.in]: dates },
        status_id: 4
      },
      attributes: ['manager_id', 'date'],
      raw: true
    })

    const receptionsByManager: Record<number, Record<string, number>> = {}

    managerIds.forEach(managerId => {
      receptionsByManager[managerId] = {}
      weekdays.forEach(weekday => (receptionsByManager[managerId][weekday] = 0))
    })

    receptions.forEach((reception: any) => {
      const managerId = reception.manager_id
      const weekdayStr = moment(reception.date).format('dd')

      if (
        receptionsByManager[managerId] &&
        receptionsByManager[managerId][weekdayStr] !== undefined
      ) {
        receptionsByManager[managerId][weekdayStr]++
      }
    })

    return receptionsByManager
  }

  async getReceptionStatsPerWeekdayByAllManagers(
    centerId: number
  ): Promise<
    Record<number, { total: number[]; completed: number[]; declined: number[] }>
  > {
    const today = moment()
    const lastFiveWeekdays = this.getLastWeekdays(today)
    const dates = lastFiveWeekdays.map(day => day.format('YYYY-MM-DD'))

    const managers = await this.managersRepository.findAll({
      where: { center_id: centerId },
      attributes: ['manager_id']
    })

    const managerIds = managers.map(manager => manager.manager_id)

    if (managerIds.length === 0) {
      return {}
    }

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: { [Op.in]: managerIds },
        date: { [Op.in]: dates }
      },
      attributes: ['manager_id', 'date', 'status_id'],
      raw: true
    })

    const statsByManager: Record<
      number,
      { total: number[]; completed: number[]; declined: number[] }
    > = {}
    managerIds.forEach(id => {
      statsByManager[id] = {
        total: Array(5).fill(0),
        completed: Array(5).fill(0),
        declined: Array(5).fill(0)
      }
    })

    receptions.forEach((reception: any) => {
      const managerId = reception.manager_id
      const dateStr = moment(reception.date).format('YYYY-MM-DD')
      const index = dates.indexOf(dateStr)

      if (index !== -1) {
        statsByManager[managerId].total[index]++
        if (reception.status_id === 4) {
          statsByManager[managerId].completed[index]++
        } else if (reception.status_id === 5) {
          statsByManager[managerId].declined[index]++
        }
      }
    })

    return statsByManager
  }

  async getDailySummaryByCenter(centerId: number): Promise<
    Record<
      number,
      {
        totalReceptions: number
        problematicRate: number
        averageRating: number
        managerLoad: number
      }
    >
  > {
    const today = moment().format('YYYY-MM-DD')

    const managers = await this.managersRepository.findAll({
      where: { center_id: centerId },
      attributes: ['manager_id']
    })

    const managerIds = managers.map(manager => manager.manager_id)

    if (managerIds.length === 0) {
      return {}
    }

    const receptions = await this.receptionRepository.findAll({
      where: {
        manager_id: { [Op.in]: managerIds },
        date: today
      },
      attributes: ['manager_id', 'status_id', 'rating'],
      raw: true
    })

    const summaryByManager: Record<
      number,
      {
        totalReceptions: number
        problematicRate: number
        averageRating: number
        managerLoad: number
      }
    > = {}
    const maxDailyLoad = 32

    managerIds.forEach(id => {
      summaryByManager[id] = {
        totalReceptions: 0,
        problematicRate: 0,
        averageRating: 0,
        managerLoad: 0
      }
    })

    const ratings: Record<number, number[]> = {}
    receptions.forEach((reception: any) => {
      const managerId = reception.manager_id

      summaryByManager[managerId].totalReceptions++

      if (
        reception.status_id === 5 ||
        (reception.rating !== null && reception.rating < 3)
      ) {
        summaryByManager[managerId].problematicRate++
      }

      if (reception.rating !== null) {
        if (!ratings[managerId]) {
          ratings[managerId] = []
        }
        ratings[managerId].push(reception.rating)
      }
    })

    managerIds.forEach(id => {
      if (ratings[id] && ratings[id].length > 0) {
        const totalRating = ratings[id].reduce((sum, rating) => sum + rating, 0)
        summaryByManager[id].averageRating = totalRating / ratings[id].length
      }

      summaryByManager[id].managerLoad =
        (summaryByManager[id].totalReceptions / maxDailyLoad) * 100
    })

    return summaryByManager
  }
}
