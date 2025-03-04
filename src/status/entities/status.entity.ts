import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Reception } from "src/general/receptions/entities/reception.entity";

enum Statuses {
  ASSIGMENT = "assignment",
  PENDING = "pending",
  WORKING = "working",
  DONE = "done",
  CANCELED = "canceled",
  CHOICE = "choice",
}

@Table({ tableName: "reception_statuses" })
export class Status extends Model<Status> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column
  name: Statuses;

  @HasMany(() => Reception)
  receptions: Reception[];
}
