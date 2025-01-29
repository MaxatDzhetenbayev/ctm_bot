import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import sequelize from "sequelize";

import { Center } from "../centers/entities/center.entity";
import { Reception } from "./entities/reception.entity";
import { User } from "src/default/users/entities/user.entity";
import { Service } from "../services/entities/service.entity";
import { Role } from "src/default/users/entities/role.entity";

@Injectable()
export class ReceptionsService {
  constructor(
    @InjectModel(Reception)
    private receptionRepository: typeof Reception,
    @InjectModel(User)
    private userRepository: typeof User,
    private readonly sequelize: Sequelize
  ) {}

  logger = new Logger(ReceptionsService.name);

  async create(body: {
    user_id: number;
    manager_id: number;
    date: string;
    time: string;
    status_id: number;
  }) {
    try {
      const reception = await this.receptionRepository.create(body);

      return reception;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException("Ошибка при создании приема");
    }
  }

  async findFreeTimeSlots(centerId: number, serviceId: number, date: string) {
    try {
      // Массив всех возможных временных слотов с 9:00 до 18:00
      const availableSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          availableSlots.push(time);
        }
      }
      console.log();

      const managers = await this.userRepository.findAll({
        include: [
          {
            model: Center,
            where: { id: centerId },
          },
          {
            model: Service,
            where: { id: serviceId },
          },
          {
            model: Role,
            where: { name: "manager" },
          },
          {
            model: Reception,
            as: "manager_works",
            required: false,
            where: {
              date,
            },
          },
        ],
      });

      const freeSlotsPerManager = managers.map((manager) => {
        const bookedSlots = new Set();
        if (manager.manager_works) {
          manager.manager_works.forEach((reception) => {
            const bookedTime = reception.time.substring(0, 5);
            bookedSlots.add(bookedTime);
          });
        }

        // Список свободных слотов для текущего менеджера
        const freeSlots = availableSlots.filter(
          (slot) => !bookedSlots.has(slot)
        );

        return {
          managerId: manager.id,
          freeSlots,
        };
      });

      const globalFreeSlots = new Set();
      freeSlotsPerManager.forEach(({ freeSlots }) => {
        freeSlots.forEach((slot) => globalFreeSlots.add(slot));
      });

      return Array.from(globalFreeSlots).sort();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Ошибка при получении расписания приемов"
      );
    }
  }

  async choiceManager(body: {
    center_id: number;
    service_id: number;
    user_id: number;
    date: string;
    time: string;
  }) {
    const { date, time, center_id, service_id, user_id } = body;
    const transaction = await this.sequelize.transaction();

    try {
      const managers = await this.userRepository.findAll({
        attributes: ["id"],
        include: [
          {
            model: Role,
            attributes: [],
            where: { name: "manager" },
          },
          {
            model: Center,
            where: { id: center_id },
            attributes: [],
          },
          {
            attributes: [],
            model: Service,
            where: { id: service_id },
          },
          {
            model: Reception,
            as: "manager_works",
            required: false,
            where: {
              date,
              time,
            },
            attributes: [],
          },
        ],
        where: sequelize.literal("manager_works.id IS NULL"),
      });

      const managersIds = managers.map((manager) => manager.id);

      const leastBusyManagersAsc = await this.userRepository.findAll({
        attributes: {
          exclude: [
            "auth_type",
            "telegram_id",
            "password_hash",
            "role_id",
            "login",
          ],
          include: [
            [
              sequelize.cast(
                sequelize.fn("COUNT", sequelize.col("manager_works.id")),
                "INTEGER"
              ),
              "receptions_count",
            ],
          ],
        },
        include: [
          {
            model: Reception,
            as: "manager_works",
            required: false,
            where: {
              date,
            },
            attributes: [],
          },
          {
            model: Center,
            attributes: ["name"],
            where: { id: center_id },
            through: { attributes: [] },
          },
          {
            model: Service,
            attributes: ["name"],
            where: { id: service_id },
            through: { attributes: [] },
          },
        ],
        where: {
          id: managersIds,
        },
        group: ["User.id", "centers.id", "services.id"],
        order: [[sequelize.literal("receptions_count"), "ASC"]],
      });

      const leastBusyManager = leastBusyManagersAsc[0];

      if (!leastBusyManager) {
        throw new InternalServerErrorException("Нет свободных менеджеров");
      }

      const reception = await this.receptionRepository.create({
        user_id,
        manager_id: leastBusyManager.id,
        status_id: 2,
        date,
        time,
      });

      if (!reception) {
        this.logger.error("Ошибка при создании приема");
        throw new InternalServerErrorException("Ошибка при создании приема");
      }

      const managerProfile = await leastBusyManager.$get("profile");
      const { table } = await leastBusyManager.$get("manager_table");

      const center = leastBusyManager.get("centers")[0].name;
      const service = leastBusyManager.get("services")[0].name;

      return {
        reception,
        profile: managerProfile,
        table,
        center,
        service,
      };
    } catch (error) {
      this.logger.error(`Ошибка при выборе менеджера: ${error}`);
      throw new InternalServerErrorException("Ошибка при выборе менеджера");
    }
  }
}
