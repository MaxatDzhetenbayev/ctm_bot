import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/sequelize";
import { Reception } from "src/manage/receptions/entities/reception.entity";
import { User } from "../users/entities/user.entity";
import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { Telegraf } from "telegraf";
import { InjectBot } from "nestjs-telegraf";
import { Service } from "src/manage/services/entities/service.entity";
import { Profile } from "../users/entities/profile.entity";
import { ManagerTable } from "../users/entities/manager-table.entity";
import * as moment from "moment";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Reception)
    private receptionRepository: typeof Reception,
    private readonly sequelize: Sequelize,
    @InjectBot() private readonly bot: Telegraf
  ) {}

  @Cron("0,30 * * * *")
  async sendReminders() {
    const date = new Date().toISOString();

    const hourLater = moment(new Date()).add(1, "hour").format("HH:mm:ss");

    const receptions = await this.receptionRepository.findAll({
      attributes: ["date", "time"],
      where: {
        [Op.and]: [
          this.sequelize.where(
            this.sequelize.fn("date", this.sequelize.col("date")),
            date.split("T")[0]
          ),
          {
            time: hourLater,
          },
        ],
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["telegram_id"],
        },
        {
          model: User,
          as: "manager",
          attributes: ["id"],
          include: [
            {
              model: Service,
              as: "services",
              attributes: ["name"],
              through: { attributes: [] },
            },
            {
              model: Profile,
              attributes: ["full_name"],
            },
            {
              model: ManagerTable,
              attributes: ["table"],
            },
          ],
        },
      ],
    });

    if (receptions.length === 0) return;

    for (const reception of receptions) {
      this.bot.telegram.sendMessage(
        reception.user.telegram_id,
        `Напоминаем вам о приеме:
    	  \nДата: ${moment(reception.date).format("DD.MM.YYYY")}
    	  \nВремя: ${reception.time}
    	  \nУслуга: ${reception.manager.services[0].name["ru"]}
    	  \nМенеджер: ${reception.manager.profile.full_name}
    	  \nСтол: ${reception.manager.manager_table.table}
    	  `
      );
    }
  }
}
