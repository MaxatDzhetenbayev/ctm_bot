import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { InjectModel } from '@nestjs/sequelize'
import { Service } from './entities/service.entity'
import { ManagerServices } from './entities/manager-services.entity'
import { VisitorTypesTable } from '../users/entities/visitor_types.entity'

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service)
    private serviceRepository: typeof Service,
    @InjectModel(ManagerServices)
    private managerServicesRepository: typeof ManagerServices
  ) {}

  logger = new Logger(ServicesService.name)

  async create(createServiceDto: CreateServiceDto) {
    try {
      this.logger.log(`Создание сервиса: ${createServiceDto.name}`)

      const service = await this.serviceRepository.create(createServiceDto)

      if (!service) {
        this.logger.error(
          `Ошибка при создании сервиса: ${createServiceDto.name}`
        )
        new InternalServerErrorException('Ошибка при создании сервиса')
      }
    } catch (error) {
      this.logger.error(`Ошибка при создании сервиса: ${error}`)
      new InternalServerErrorException('Ошибка при создании сервиса')
    }
  }

  async findAll(visitor_type_id?: number) {
    try {
      const where = visitor_type_id ? { id: visitor_type_id } : undefined
      const services = await this.serviceRepository.findAll({
        include: [
          {
            model: VisitorTypesTable,
            where,
            through: { attributes: [] }
          }
        ]
      })

      console.log(services)

      if (!services.length) {
        this.logger.error(`Ошибка при получении списка сервисов`)
        throw new NotFoundException('Сервисы не найдены')
      }

      // Функция для построения иерархии
      const buildHierarchy = (parentId: number | null) => {
        return services
          .filter(service => service.parent_id === parentId)
          .map(service => ({
            id: service.id,
            name: service.name,
            children: buildHierarchy(service.id)
          }))
      }

      return buildHierarchy(null)
    } catch (error) {
      this.logger.error(`Ошибка при получении списка сервисов: ${error}`)
      throw new InternalServerErrorException(
        'Ошибка при получении списка сервисов'
      )
    }
  }

  async findOne(id: number) {
    try {
      const service = await this.serviceRepository.findOne({
        where: { id },
        attributes: ['id', 'name'],
        include: {
          model: this.serviceRepository,
          as: 'children',
          attributes: ['id', 'name']
        }
      })

      if (!service) {
        this.logger.error(`Сервис не найден: ${id}`)
        new NotFoundException('Сервис не найден')
      }

      return service
    } catch (error) {
      this.logger.error(`Ошибка при получении сервиса: ${error}`)
      new InternalServerErrorException('Ошибка при получении сервиса')
    }
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`
  }

  remove(id: number) {
    return `This action removes a #${id} service`
  }
}
