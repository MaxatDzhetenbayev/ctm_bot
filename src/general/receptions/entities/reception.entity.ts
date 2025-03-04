import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from 'src/general/users/entities/user.entity'
import { Status } from 'src/status/entities/status.entity'
import { Service } from 'src/general/services/entities/service.entity'

@Table({ tableName: 'receptions', timestamps: true })
export class Reception extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true
  })
  id: number

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  user_id: number

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  manager_id: number

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  date: Date

  @Column({
    type: DataType.TIME,
    allowNull: false
  })
  time: string

  @ForeignKey(() => Status)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  status_id: number

  @ForeignKey(() => Service)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  service_id: number

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  rating?: number

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  createdAt: Date

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt: Date

  @BelongsTo(() => Status)
  status: Status

  @BelongsTo(() => User, 'user_id')
  user: User

  @BelongsTo(() => User, 'manager_id')
  manager: User

  @BelongsTo(() => Service)
  service: Service
}