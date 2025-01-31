import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";

import * as bcrypt from "bcrypt";

import { Role } from "./role.entity";
import { Profile } from "./profile.entity";
import { Center } from "src/general/centers/entities/center.entity";
import { UsersCenter } from "src/general/centers/entities/users_center.entity";
import { Service } from "src/general/services/entities/service.entity";
import { ManagerServices } from "src/general/services/entities/manager-services.entity";
import { Reception } from "src/general/receptions/entities/reception.entity";
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

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed("password_hash")) {
      const salt = await bcrypt.genSalt(10);
      instance.password_hash = await bcrypt.hash(instance.password_hash, salt);
    }
  }
}
