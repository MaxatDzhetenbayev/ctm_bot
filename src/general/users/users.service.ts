import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { AuthType, User } from "./entities/user.entity";
import { Profile } from "./entities/profile.entity";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { CreateUserByTelegramDto } from "./dto/create-user-by-telegram.dto";
import { Center } from "../centers/entities/center.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { Role } from "./entities/role.entity";

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

  async createUser(dto: CreateUserDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const { login, password, role, profile, center_id, service_ids } = dto;

      const findUserInCenter = await this.usersRepository.findOne({
        where: {
          login,
        },
        include: [
          {
            model: Center,
            where: {
              id: center_id,
            },
            attributes: [],
            through: { attributes: [] },
          },
        ],
      });

      if (findUserInCenter) {
        throw new ConflictException(
          "Пользователь с таким логином уже существует в данном центре"
        );
      }

      const user = await this.usersRepository.create(
        {
          login,
          password_hash: password,
          role_id: role,
          auth_type: AuthType.default,
        },
        {
          transaction,
        }
      );

      if (!user) {
        throw new InternalServerErrorException(
          "Ошибка при создании пользователя"
        );
      }

      const userProfile = await user.$create("profile", profile, {
        transaction,
      });

      if (!userProfile) {
        throw new InternalServerErrorException(
          "Ошибка при создании профиля пользователя"
        );
      }

      await user.$add("centers", center_id, { transaction });

      if (service_ids) {
        await user.$add("services", service_ids, { transaction });
      }

      await transaction.commit();

      const { password_hash, ...user_data } = user.toJSON();

      return user_data;
    } catch (error) {
      await transaction.rollback();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Ошибка при создании пользователя"
      );
    }
  }

  async validateUserByLogin(login: string) {
    const user = await this.usersRepository.findOne({
      where: {
        login: login,
      },
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
      ],
      plain: true,
    });

    return user;
  }

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

  async validateUserByTelegram(telegram_id: string) {
    this.logger.log("Проверка пользователя");
    const user = await this.usersRepository.findOne({
      where: {
        telegram_id,
      },
    });

    return user;
  }
}
