import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import { Role } from "./role.entity";
import { Profile } from "./profile.entity";
import { Center } from "src/manage/centers/entities/center.entity";
import { UsersCenter } from "src/manage/centers/entities/users_center.entity";
import { Service } from "src/manage/services/entities/service.entity";
import { ManagerServices } from "src/manage/services/entities/manager-services.entity";
import { Reception } from "src/manage/receptions/entities/reception.entity";
import { ManagerTable } from "./manager-table.entity";

export enum AuthType {
  telegram = "telegram",
  default = "default",
  offline = "offline",
}

@Table({
  tableName: "users",
  timestamps: false,
})
export class User extends Model<User> {
  @Column({ defaultValue: "telegram" })
  auth_type: AuthType;

  @Column
  telegram_id: string;

  @Column
  login: string;

  @Column
  password_hash: string;

  @ForeignKey(() => Role)
  role_id: number;

  @BelongsTo(() => Role)
  role: Role;

  @HasOne(() => Profile, {
    foreignKey: "id",
  })
  profile: Profile;

  @BelongsToMany(() => Center, () => UsersCenter)
  centers: Center[];

  @BelongsToMany(() => Service, () => ManagerServices)
  services: Service[];

  @HasOne(() => ManagerTable)
  manager_table: ManagerTable;

  @HasMany(() => Reception, { foreignKey: "user_id", as: "user_receptions" })
  user_receptions!: Reception[];

  @HasMany(() => Reception, {
    foreignKey: "manager_id",
    as: "manager_works",
  })
  manager_works!: Reception[];
}
