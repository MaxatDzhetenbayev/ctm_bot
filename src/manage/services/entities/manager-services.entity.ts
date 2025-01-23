import { ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "src/default/users/entities/user.entity";
import { Service } from "./service.entity";

@Table({
  tableName: "manager_services",
  timestamps: false,
})
export class ManagerServices extends Model<ManagerServices> {
  @ForeignKey(() => User)
  manager_id: string;

  @ForeignKey(() => Service)
  service_id: number;
}
