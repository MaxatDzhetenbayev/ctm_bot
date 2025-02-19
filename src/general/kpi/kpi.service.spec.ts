import { getModelToken } from '@nestjs/sequelize'
import { Test, TestingModule } from '@nestjs/testing'
import { Reception } from '../receptions/entities/reception.entity'
import { ManagerTable } from '../users/entities/manager-table.entity'
import { KpiService } from './kpi.service'

describe('KpiService', () => {
  let kpiService: KpiService
  let receptionModel
  let managerModel

  beforeEach(async () => {
    receptionModel = {
      findAll: jest.fn(),
      count: jest.fn()
    }

    managerModel = {
      findAll: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KpiService,
        {
          provide: getModelToken(Reception),
          useValue: receptionModel
        },
        {
          provide: getModelToken(ManagerTable),
          useValue: managerModel
        }
      ]
    }).compile()

    kpiService = module.get<KpiService>(KpiService)
  })

  describe('getReceptionsPerWeekday', () => {
    it('should return receptions count per weekday', async () => {
      receptionModel.findAll.mockResolvedValue([
        { date: '2024-02-19' },
        { date: '2024-02-20' }
      ])

      const result = await kpiService.getReceptionsPerWeekday(1)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })
  })

  describe('getReceptionStatsPerWeekday', () => {
    it('should return total, completed, and declined receptions', async () => {
      receptionModel.findAll.mockResolvedValue([
        { status_id: 4 },
        { status_id: 5 },
        { status_id: 4 }
      ])

      const result = await kpiService.getReceptionStatsPerWeekday(1)

      expect(result).toEqual({ total: 3, completed: 2, declined: 1 })
    })
  })

  describe('getTotalReceptionsToday', () => {
    it('should return total receptions for today', async () => {
      receptionModel.count.mockResolvedValue(5)

      const result = await kpiService.getTotalReceptionsToday(1)

      expect(result).toBe(5)
    })
  })

  describe('getProblematicReceptionsRate', () => {
    it('should return count of problematic receptions', async () => {
      receptionModel.count.mockResolvedValue(2)

      const result = await kpiService.getProblematicReceptionsRate(1)

      expect(result).toBe(2)
    })
  })

  describe('getAverageClientRating', () => {
    it('should return average client rating', async () => {
      receptionModel.findAll.mockResolvedValue([
        { rating: 4 },
        { rating: 5 },
        { rating: 3 }
      ])

      const result = await kpiService.getAverageClientRating(1)

      expect(result).toBe(4)
    })

    it('should return 0 if there are no ratings', async () => {
      receptionModel.findAll.mockResolvedValue([])

      const result = await kpiService.getAverageClientRating(1)

      expect(result).toBe(0)
    })
  })

  describe('getManagerLoadToday', () => {
    it('should return manager load percentage', async () => {
      receptionModel.count.mockResolvedValue(16)

      const result = await kpiService.getManagerLoadToday(1)

      expect(result).toBe(50)
    })
  })

  describe('getReceptionsPerWeekdayByCenter', () => {
    it('should return receptions per weekday by center', async () => {
      managerModel.findAll.mockResolvedValue([
        { manager_id: 1 },
        { manager_id: 2 }
      ])
      receptionModel.findAll.mockResolvedValue([
        { manager_id: 1, date: '2024-02-19' },
        { manager_id: 2, date: '2024-02-20' }
      ])

      const result = await kpiService.getReceptionsPerWeekdayByCenter(1)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return empty object if no managers found', async () => {
      managerModel.findAll.mockResolvedValue([])

      const result = await kpiService.getReceptionsPerWeekdayByCenter(1)

      expect(result).toEqual({})
    })
  })

  describe('getReceptionStatsPerWeekdayByAllManagers', () => {
    it('should return reception stats per weekday for all managers', async () => {
      managerModel.findAll.mockResolvedValue([
        { manager_id: 1 },
        { manager_id: 2 }
      ])
      receptionModel.findAll.mockResolvedValue([
        { manager_id: 1, date: '2024-02-19', status_id: 4 },
        { manager_id: 2, date: '2024-02-20', status_id: 5 }
      ])

      const result =
        await kpiService.getReceptionStatsPerWeekdayByAllManagers(1)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return empty object if no managers found', async () => {
      managerModel.findAll.mockResolvedValue([])

      const result =
        await kpiService.getReceptionStatsPerWeekdayByAllManagers(1)

      expect(result).toEqual({})
    })
  })

  describe('getDailySummaryByCenter', () => {
    it('should return daily summary by center', async () => {
      managerModel.findAll.mockResolvedValue([
        { manager_id: 1 },
        { manager_id: 2 }
      ])
      receptionModel.findAll.mockResolvedValue([
        { manager_id: 1, status_id: 4, rating: 5 },
        { manager_id: 2, status_id: 5, rating: 3 }
      ])

      const result = await kpiService.getDailySummaryByCenter(1)

      expect(result).toBeDefined()
      expect(typeof result).toBe('object')
    })

    it('should return empty object if no managers found', async () => {
      managerModel.findAll.mockResolvedValue([])

      const result = await kpiService.getDailySummaryByCenter(1)

      expect(result).toEqual({})
    })
  })
})
