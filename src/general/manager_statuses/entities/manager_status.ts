import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import { User } from 'src/general/users/entities/user.entity'

export const MANAGER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
} as const
export type ManagerStatusType =
  (typeof MANAGER_STATUS)[keyof typeof MANAGER_STATUS]

@Table({
  tableName: 'manager_statuses',
  timestamps: false
})
export class ManagerStatus extends Model<ManagerStatus> {
  @ForeignKey(() => User)
  @Column
  manager_id: number

  @Column status: ManagerStatusType

  @BelongsTo(() => User)
  manager: User
}
