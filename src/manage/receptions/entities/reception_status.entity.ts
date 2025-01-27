import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { Reception } from "./reception.entity";

@Table({ tableName: "reception_statuses", timestamps: true })
export class ReceptionStatus extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: "assignment" | "pending" | "working" | "done" | "canceled" | "choise";

  @HasMany(() => Reception)
  receptions: Reception[];
}
