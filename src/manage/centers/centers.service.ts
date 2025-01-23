import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { CreateCenterDto } from "./dto/create-center.dto";
import { UpdateCenterDto } from "./dto/update-center.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Center } from "./entities/center.entity";
import { UsersCenter } from "./entities/managers_center.entity";

@Injectable()
export class CentersService {
  constructor(
    @InjectModel(Center)
    private centerRepository: typeof Center,
    @InjectModel(UsersCenter)
    private usersCenterRepository: typeof UsersCenter
  ) {}

  private readonly logger = new Logger(this.centerRepository.name);

  async create(createCenterDto: CreateCenterDto) {
    try {
      const center = await this.centerRepository.create(createCenterDto);
      if (!center) {
        this.logger.error("Ошибка при создании центра");
        throw new InternalServerErrorException("Ошибка при создании центра");
      }

      return center;
    } catch (error) {
      this.logger.error(`Ошибка при создании центра. Ошибка: ${error}`);
    }
  }

  async findAll() {
    try {
      const centers = await this.centerRepository.findAll();
      if (!centers) {
        this.logger.error("Ошибка при получении центров");
      }

      return centers;
    } catch (error) {
      this.logger.error(`Ошибка при получении центров. Ошибка: ${error}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} center`;
  }

  update(id: number, updateCenterDto: UpdateCenterDto) {
    return `This action updates a #${id} center`;
  }

  remove(id: number) {
    return `This action removes a #${id} center`;
  }
}
