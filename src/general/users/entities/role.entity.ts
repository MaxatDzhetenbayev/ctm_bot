import { Column, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "./user.entity";

export enum RoleType {
  admin = "admin",
  hr = "hr",
  manager = "manager",
  user = "user",
}

@Table({
  tableName: "roles",
  timestamps: false,
})
export class Role extends Model<Role> {
  @Column
  name: RoleType;

  @HasMany(() => User)
  users: User[];
}
