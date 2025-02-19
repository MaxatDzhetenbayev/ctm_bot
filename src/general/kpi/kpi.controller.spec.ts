import { Test, TestingModule } from '@nestjs/testing'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { KpiController } from './kpi.controller'
import { KpiService } from './kpi.service'

describe('KpiController', () => {
  let kpiController: KpiController
  let kpiService: KpiService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiController],
      providers: [
        {
          provide: KpiService,
          useValue: {
            getReceptionsPerWeekdayByCenter: jest.fn(),
            getReceptionStatsPerWeekdayByAllManagers: jest.fn(),
            getDailySummaryByCenter: jest.fn()
          }
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({})
      .overrideGuard(RolesGuard)
      .useValue({})
      .compile()

    kpiController = module.get<KpiController>(KpiController)
    kpiService = module.get<KpiService>(KpiService)
  })

  describe('findLastWeekdayByCenter', () => {
    it('should return aggregated stats for last weekdays', async () => {
      const mockStats = {
        18: { ср: 1, чт: 2, пт: 3, пн: 4, вт: 5 },
        19: { ср: 2, чт: 1, пт: 0, пн: 3, вт: 2 }
      }
      jest
        .spyOn(kpiService, 'getReceptionsPerWeekdayByCenter')
        .mockResolvedValue(mockStats)

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.findLastWeekdayByCenter(req)

      expect(result).toEqual({ ср: 3, чт: 3, пт: 3, пн: 7, вт: 7 })
      expect(kpiService.getReceptionsPerWeekdayByCenter).toHaveBeenCalledWith(1)
    })

    it('should return empty stats when no data available', async () => {
      jest
        .spyOn(kpiService, 'getReceptionsPerWeekdayByCenter')
        .mockResolvedValue({})

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.findLastWeekdayByCenter(req)

      expect(result).toEqual({})
    })
  })

  describe('getStatsByCenter', () => {
    it('should return total stats aggregated across all managers', async () => {
      const mockStats = {
        18: { total: [1, 2, 3], completed: [1, 1, 1], declined: [0, 1, 0] },
        19: { total: [2, 3, 4], completed: [2, 2, 2], declined: [1, 1, 1] }
      }
      jest
        .spyOn(kpiService, 'getReceptionStatsPerWeekdayByAllManagers')
        .mockResolvedValue(mockStats)

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.getStatsByCenter(req)

      expect(result).toEqual({ total: 15, completed: 9, declined: 4 })
      expect(
        kpiService.getReceptionStatsPerWeekdayByAllManagers
      ).toHaveBeenCalledWith(1)
    })

    it('should return zero stats when no data available', async () => {
      jest
        .spyOn(kpiService, 'getReceptionStatsPerWeekdayByAllManagers')
        .mockResolvedValue({})

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.getStatsByCenter(req)

      expect(result).toEqual({ total: 0, completed: 0, declined: 0 })
    })
  })

  describe('getDailySummaryByCenter', () => {
    it('should return aggregated daily summary for a center', async () => {
      const mockSummaries = {
        18: {
          totalReceptions: 10,
          problematicRate: 0.2,
          averageRating: 4.5,
          managerLoad: 80
        },
        19: {
          totalReceptions: 5,
          problematicRate: 0.3,
          averageRating: 4.2,
          managerLoad: 70
        }
      }
      jest
        .spyOn(kpiService, 'getDailySummaryByCenter')
        .mockResolvedValue(mockSummaries)

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.getDailySummaryByCenter(req)

      expect(result).toEqual({
        totalReceptions: 15,
        problematicRate: 0.25,
        averageRating: 4.35,
        managerLoad: 75
      })
      expect(kpiService.getDailySummaryByCenter).toHaveBeenCalledWith(1)
    })

    it('should return zero summary when no data available', async () => {
      jest.spyOn(kpiService, 'getDailySummaryByCenter').mockResolvedValue({})

      const req = { user: { center_id: 1 } } as any
      const result = await kpiController.getDailySummaryByCenter(req)

      expect(result).toEqual({
        totalReceptions: 0,
        problematicRate: 0,
        averageRating: 0,
        managerLoad: 0
      })
    })
  })
})
