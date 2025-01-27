import { allow } from "joi";
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { User } from "src/default/users/entities/user.entity";
import { ReceptionStatus } from "./reception_status.entity";

@Table({ tableName: "receptions", timestamps: true })
export class Reception extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  manager_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  time: string;

  @ForeignKey(() => ReceptionStatus)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  status_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  rating?: number;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  createdAt: Date;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  updatedAt: Date;

  @BelongsTo(() => ReceptionStatus)
  status: ReceptionStatus;

  @BelongsTo(() => User, "user_id")
  user: User;

  @BelongsTo(() => User, "manager_id")
  manager: User;
}
