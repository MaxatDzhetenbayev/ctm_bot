import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { ManagerServices } from "./manager-services.entity";
import { User } from "src/general/users/entities/user.entity";

@Table({
  tableName: "services",
  timestamps: false,
})
export class Service extends Model<Service> {
  @Column({
    type: DataType.JSONB,
  })
  name: Record<string, string>;

  @ForeignKey(() => Service)
  @Column
  parent_id: number;

  @BelongsTo(() => Service, { as: "parent" })
  parent: Service;

  @HasMany(() => Service, { foreignKey: "parent_id", as: "children" })
  children: Service[];

  @BelongsToMany(() => User, () => ManagerServices)
  users: User[];
}
