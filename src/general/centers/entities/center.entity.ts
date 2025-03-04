import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { UsersCenter } from "./users_center.entity";
import { User } from "src/general/users/entities/user.entity";
import { ManagerTable } from "src/general/users/entities/manager-table.entity";

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

  @HasMany(() => ManagerTable)
  manager_tables: ManagerTable[];
}
