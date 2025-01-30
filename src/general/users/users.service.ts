import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { Profile } from "./entities/profile.entity";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CreateUserByTelegramDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly usersRepository: typeof User,
    @InjectModel(Profile)
    private readonly profilesRepository: typeof Profile,
    private readonly sequelize: Sequelize
  ) {}

  private readonly logger = new Logger(this.usersRepository.name);

  async createUser() {}

  async createUserByTelegram(dto: CreateUserByTelegramDto) {
    this.logger.log("Создание пользователя");
    try {
      const transaction = await this.sequelize.transaction();

      const { role, full_name, iin, phone, ...userData } = dto;

      const user = await this.usersRepository.create(userData, {
        transaction,
      });

      if (!user) {
        this.logger.error("Ошибка при создании пользователя");
        throw new InternalServerErrorException(
          "Ошибка при создании пользователя"
        );
      }

      const profile = await this.profilesRepository.create(
        {
          id: user.id,
          iin,
          full_name,
          phone,
        },
        { transaction }
      );

      if (!profile) {
        this.logger.error("Ошибка при создании профиля пользователя");
        throw new InternalServerErrorException(
          "Ошибка при создании профиля пользователя"
        );
      }

      await user.$set("role", role, { transaction });

      await transaction.commit();

      const result = {
        user: user.toJSON(),
        profile: profile.toJSON(),
      };

      return result;
    } catch (error) {
      this.logger.error("Ошибка при создании пользователя. Ошибка: " + error);
      throw new InternalServerErrorException(
        "Ошибка при создании пользователя"
      );
    }
  }

  async validateUser(telegram_id: string) {
    this.logger.log("Проверка пользователя");
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id,
      },
    });

    return user;
  }
}
