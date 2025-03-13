import {
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table
} from 'sequelize-typescript'
import { DataTypes } from 'sequelize'
import { User } from './user.entity'
import { Service } from 'src/general/services/entities/service.entity'
import { ServiceVisitorType } from 'src/general/services/entities/service-visitor.entity'

@Table({
  tableName: 'visitor_types',
  timestamps: false
})
export class VisitorTypesTable extends Model<VisitorTypesTable> {
  @Column({
    allowNull: false,
    type: DataTypes.STRING
  })
  name: string

  @HasMany(() => User, { foreignKey: 'visitor_type_id' })
  users: User[]

  @BelongsToMany(() => Service, () => ServiceVisitorType)
  services: Service[]
}
