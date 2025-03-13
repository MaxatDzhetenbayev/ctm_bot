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
import { Service } from "./service.entity";

@Table({
  tableName: "visitor_types",
  timestamps: false,
})
export class VisitorType extends Model<VisitorType> {
  @Column({
    type: DataType.JSONB,
  })
  name: Record<string, string>;


  @HasMany(() => Service)
  services: Service;
}
