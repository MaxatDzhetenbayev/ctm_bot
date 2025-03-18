import { BadRequestException } from '@nestjs/common'
import {
  BeforeSave,
  Column,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import { Center } from 'src/general/centers/entities/center.entity'
import { User } from 'src/general/users/entities/user.entity'

@Table({ tableName: 'audit_logs', timestamps: true })
export class AuditLog extends Model<AuditLog> {
  @Column id: number
  @Column action: string
  @Column time: string

  @ForeignKey(() => User)
  @Column
  manager_id: number
  @ForeignKey(() => Center)
  @Column
  center_id: number

  @BeforeSave
  static async checkUserRole(instance: AuditLog) {
    const user = await User.findOne({ where: { id: instance.manager_id } })
    if (user.role_id !== 3) {
      throw new BadRequestException('пользователь должен быть менеджером')
    }
  }
}
