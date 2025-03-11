import { Column, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { DataTypes } from "sequelize";
import { User } from "./user.entity";

@Table({
  tableName: "visitor_types",
  timestamps: false,
})
export class VisitorTypesTable extends Model<VisitorTypesTable> {
  @Column({
    allowNull: false,
    type: DataTypes.NUMBER,
  })
  name: number;

  @HasMany(() => User, { foreignKey: "visitor_type_id" })
  users: User[]
}
