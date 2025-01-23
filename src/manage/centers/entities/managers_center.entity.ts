import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/default/users/entities/user.entity";
import { Center } from "./center.entity";

@Table({
  tableName: "users_center",
  timestamps: false,
})
export class UsersCenter extends Model<UsersCenter> {
  @ForeignKey(() => User)
  user_id: number;
  @ForeignKey(() => Center)
  center_id: number;
}
