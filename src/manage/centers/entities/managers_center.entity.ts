import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/default/users/entities/user.entity";
import { Center } from "./center.entity";

@Table({
  tableName: "managers_center",
  timestamps: false,
})
export class ManagersCenter extends Model<ManagersCenter> {
  @ForeignKey(() => User)
  manager_id: number;
  @ForeignKey(() => Center)
  center_id: number;
}
