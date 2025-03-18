import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Scopes,
  Table
} from 'sequelize-typescript'

import * as bcrypt from 'bcrypt'

import { Role } from './role.entity'
import { Profile } from './profile.entity'
import { Center } from 'src/general/centers/entities/center.entity'
import { UsersCenter } from 'src/general/centers/entities/users_center.entity'
import { Service } from 'src/general/services/entities/service.entity'
import { ManagerServices } from 'src/general/services/entities/manager-services.entity'
import { Reception } from 'src/general/receptions/entities/reception.entity'
import { ManagerTable } from './manager-table.entity'
import { VisitorTypesTable } from './visitor_types.entity'
import { WhereOptions } from 'sequelize'

export enum AuthType {
  telegram = 'telegram',
  default = 'default',
  offline = 'offline'
}

@Scopes(() => ({
  withProfile: (whereOptions?: WhereOptions) => ({
    include: [{ model: Profile, as: 'profile' }],
    where: whereOptions
  })
}))
@Table({ tableName: 'users', timestamps: false })
export class User extends Model<User> {
  @Column({ defaultValue: 'telegram' }) auth_type: AuthType
  @Column telegram_id: string
  @Column login: string
  @Column password_hash: string

  @ForeignKey(() => Role) role_id: number
  @ForeignKey(() => VisitorTypesTable) visitor_type_id: number

  @BelongsTo(() => Role) role: Role
  @BelongsTo(() => VisitorTypesTable) visitor_type: VisitorTypesTable

  @BelongsToMany(() => Center, () => UsersCenter) centers: Center[]
  @BelongsToMany(() => Service, () => ManagerServices) services: Service[]

  @HasOne(() => Profile, { foreignKey: 'id' }) profile: Profile
  @HasOne(() => ManagerTable) manager_table: ManagerTable

  @HasMany(() => Reception, { foreignKey: 'user_id', as: 'user_receptions' })
  user_receptions!: Reception[]
  @HasMany(() => Reception, { foreignKey: 'manager_id', as: 'manager_works' })
  manager_works!: Reception[]

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password_hash')) {
      const salt = await bcrypt.genSalt(10)
      instance.password_hash = await bcrypt.hash(instance.password_hash, salt)
    }
  }
}
