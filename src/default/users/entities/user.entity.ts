import {
  BelongsTo,
  Column,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import { Role } from "./role.entity";
import { Profile } from "./profile.entity";

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
}
