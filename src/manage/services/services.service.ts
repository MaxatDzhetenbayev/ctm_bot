import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Service } from "./entities/service.entity";
import { ManagerServices } from "./entities/manager-services.entity";

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service)
    private serviceRepository: typeof Service,
    @InjectModel(ManagerServices)
    private managerServicesRepository: typeof ManagerServices
  ) {}

  logger = new Logger(ServicesService.name);

  async create(createServiceDto: CreateServiceDto) {
    try {
      this.logger.log(`Создание сервиса: ${createServiceDto.name}`);

      const service = await this.serviceRepository.create(createServiceDto);

      if (!service) {
        this.logger.error(
          `Ошибка при создании сервиса: ${createServiceDto.name}`
        );
        new InternalServerErrorException("Ошибка при создании сервиса");
      }
    } catch (error) {
      this.logger.error(`Ошибка при создании сервиса: ${error}`);
      new InternalServerErrorException("Ошибка при создании сервиса");
    }
  }

  async findAll() {
    try {
      const services = await this.serviceRepository.findAll();

      if (!services) {
        this.logger.error(`Ошибка при получении списка сервисов`);
        new NotFoundException("Сервисы не найдены");
      }

      const buildHierarchy = (parentId: number | null) => {
        return services
          .filter((service) => service.parent_id === parentId)
          .map((service) => ({
            id: service.id,
            name: service.name,
            children: buildHierarchy(service.id),
          }));
      };

      return buildHierarchy(null);
    } catch (error) {
      this.logger.error(`Ошибка при получении списка сервисов: ${error}`);
      new InternalServerErrorException("Ошибка при получении списка сервисов");
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} service`;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return `This action updates a #${id} service`;
  }

  remove(id: number) {
    return `This action removes a #${id} service`;
  }
}
