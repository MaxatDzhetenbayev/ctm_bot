import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { MANAGER_STATUS, ManagerStatus } from './entities/manager_status'

@Injectable()
export class ManagerStatusService {
  constructor(
    @InjectModel(ManagerStatus)
    private managerStatusRepository: typeof ManagerStatus
  ) {}

  logger = new Logger(ManagerStatusService.name)

  async update(id: number) {
    try {
      const managerStatus = await this.managerStatusRepository.findByPk(id)

      if (!managerStatus) {
        throw new NotFoundException('Статус данного пользователя не существует')
      }

      if (managerStatus.status == MANAGER_STATUS.OFFLINE)
        await managerStatus.update('status', MANAGER_STATUS.ONLINE)

      await managerStatus.update('status', MANAGER_STATUS.OFFLINE)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }

      throw new InternalServerErrorException(
        'Ошибка при изменении статуса пользователя'
      )
    }
  }
}
