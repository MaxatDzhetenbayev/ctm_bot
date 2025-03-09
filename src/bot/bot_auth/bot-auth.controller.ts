import { Action, Ctx, On, Update } from 'nestjs-telegraf'
import { BotAuthService } from './bot_auth.service'
import { UsersService } from 'src/general/users/users.service'
import { Context } from 'vm'
import { AuthType } from 'src/general/users/entities/user.entity'
import { RoleType } from 'src/general/users/entities/role.entity'
import { BotCentersService } from '../bot_centers/bot_centers.service'

export interface RegistrationContext extends Context {
  session: {
    registrationStep?: string
    full_name?: string
    iin?: string
    phone?: string
    language: string
  }
}

@Update()
export class BotAuthController {
  constructor(
    private readonly botAuthService: BotAuthService,
    private readonly userService: UsersService,
    private readonly botCenterService: BotCentersService
  ) {}

  @Action('registration')
  async onRegistration(@Ctx() ctx: Context) {
    if (ctx.callbackQuery?.message) {
      await ctx.deleteMessage()
    }
    const language = ctx.session.language

    ctx.session.registrationStep = 'full_name'
    await ctx.reply(this.botAuthService.getStepPrompt('full_name', language))
  }

  @On('text')
  async onText(@Ctx() ctx: RegistrationContext) {
    const { registrationStep } = ctx.session
    if (!registrationStep) return

    const nextStep = await this.botAuthService.handleRegistrationStep(ctx)
    if (nextStep) {
      ctx.session.registrationStep = nextStep
      await ctx.reply(
        this.botAuthService.getStepPrompt(nextStep, ctx.session.language)
      )
    } else {
      ctx.session.registrationStep = undefined
      const { full_name, iin, phone } = ctx.session

      await this.userService.createUser({
        dto: {
          auth_type: AuthType.telegram,
          role: RoleType.user,
          telegram_id: ctx.chat?.id,
          profile: {
            full_name,
            iin,
            phone
          }
        }
      })

      await this.botCenterService.showCenters(ctx, ctx.session.language)
    }
  }
}
