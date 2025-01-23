import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from "sequelize-typescript";
import { ManagersCenter } from "./managers_center.entity";
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

  @BelongsToMany(() => User, () => ManagersCenter)
  users: User[];
}
