import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { User } from "./user.entity";
import { Center } from "src/general/centers/entities/center.entity";

@Table({
  tableName: "managers_table",
  timestamps: false,
})
export class ManagerTable extends Model<ManagerTable> {
  @ForeignKey(() => User)
  @Column
  manager_id: number;

  @ForeignKey(() => Center)
  @Column
  center_id: number;

  @Column({
    allowNull: false,
    type: DataTypes.NUMBER,
  })
  table: number;

  @Column({
    allowNull: false,
    type: DataTypes.NUMBER,
  })
  cabinet: number;
}
