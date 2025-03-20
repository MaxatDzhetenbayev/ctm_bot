import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/general/users/entities/user.entity";
import { Service } from "./service.entity";

@Table({
  tableName: "manager_services",
  timestamps: false,
})
export class ManagerServices extends Model<ManagerServices> {
  @ForeignKey(() => User)
  @Column
  manager_id: string;

  @ForeignKey(() => Service)
  @Column
  service_id: number;
}
