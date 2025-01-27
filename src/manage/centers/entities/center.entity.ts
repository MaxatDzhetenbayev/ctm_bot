import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { UsersCenter } from "./users_center.entity";
import { User } from "src/default/users/entities/user.entity";

@Table({
  tableName: "centers",
  timestamps: false,
})
export class Center extends Model<Center> {
  @Column({
    type: DataType.JSONB,
  })
  name: Record<string, string>;

  @BelongsToMany(() => User, () => UsersCenter)
  users: User[];
}
