import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { BotService } from '../bot/bot.service'
import { tf, UiLang } from '../i18n/i18n'
import { AssignCoachDto } from './dto/assign-coach.dto'
import { CoachService } from './coach.service'

interface AuthedRequest {
  user: { id: string; role: string }
}

interface PersonRow {
  first_name: string
  username: string | null
  tg_id: number
  ui_lang: string | null
}

const contactOf = (u: PersonRow): string => (u.username ? `@${u.username}` : `tg://user?id=${u.tg_id}`)

@Controller('api/admin')
@UseGuards(TelegramAuthGuard)
export class CoachController {
  constructor(
    private readonly coach: CoachService,
    private readonly bot: BotService,
  ) {}

  private assertAdmin(req: AuthedRequest): void {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only')
  }

  @Get('gold')
  gold(@Req() req: AuthedRequest) {
    this.assertAdmin(req)
    return this.coach.goldWithoutCoach()
  }

  @Post('coach')
  async assign(@Body() dto: AssignCoachDto, @Req() req: AuthedRequest) {
    this.assertAdmin(req)
    const { learner, coach } = await this.coach.assign(dto.learnerId, dto.coachUsername)
    await this.bot.notify(
      learner.tg_id,
      tf((learner.ui_lang as UiLang) ?? 'uz', 'coach_assigned_learner', {
        name: coach.first_name, contact: contactOf(coach),
      }),
    )
    await this.bot.notify(
      coach.tg_id,
      tf((coach.ui_lang as UiLang) ?? 'uz', 'coach_assigned_coach', {
        name: learner.first_name, contact: contactOf(learner),
      }),
    )
    return { assigned: true }
  }
}
