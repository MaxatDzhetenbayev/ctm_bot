import { ForeignKey, Model, Table } from 'sequelize-typescript'
import { Service } from './service.entity'
import { VisitorTypesTable } from 'src/general/users/entities/visitor_types.entity'

@Table({
  tableName: 'service_visitor_types',
  timestamps: false
})
export class ServiceVisitorType extends Model<ServiceVisitorType> {
  @ForeignKey(() => Service)
  service_id: number

  @ForeignKey(() => VisitorTypesTable)
  visitor_type_id: number
}
