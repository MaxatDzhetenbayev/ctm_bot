import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "./user.entity";

@Table({
  tableName: "profiles",
  timestamps: false,
})
export class Profile extends Model<Profile> {
  @Column
  iin: string;

  @Column
  full_name: string;

  @Column
  phone: string;

  @ForeignKey(() => User)
  id: number;

  @BelongsTo(() => User)
  user: User;
}
