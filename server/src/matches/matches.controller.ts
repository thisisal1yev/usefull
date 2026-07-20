import {
  Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { BotService } from '../bot/bot.service'
import { tf, UiLang } from '../i18n/i18n'
import { UsersService } from '../users/users.service'
import { CreateMatchDto } from './dto/create-match.dto'
import { RespondMatchDto } from './dto/respond-match.dto'
import { MatchesService } from './matches.service'

interface UserRow {
  id: string
  first_name: string
  username: string | null
  tg_id: number
  ui_lang: UiLang
}

interface AuthedRequest {
  user: UserRow
}

const contactOf = (u: UserRow): string => (u.username ? `@${u.username}` : `tg://user?id=${u.tg_id}`)

@Controller('api')
@UseGuards(TelegramAuthGuard)
export class MatchesController {
  constructor(
    private readonly matches: MatchesService,
    private readonly users: UsersService,
    private readonly bot: BotService,
  ) {}

  @Get('partners')
  partners(@Req() req: AuthedRequest, @Query('level') level?: string) {
    return this.matches.listCandidates(req.user.id, level)
  }

  @Post('matches')
  async create(@Body() dto: CreateMatchDto, @Req() req: AuthedRequest) {
    const target = (await this.users.getById(dto.toUserId)) as UserRow | null
    if (!target) throw new NotFoundException('User not found')
    const request = await this.matches.createRequest(req.user.id, dto.toUserId)
    await this.bot.notify(
      target.tg_id,
      tf(target.ui_lang ?? 'uz', 'match_request_received', { name: req.user.first_name }),
    )
    return request
  }

  @Get('matches')
  list(@Req() req: AuthedRequest) {
    return this.matches.listRequests(req.user.id)
  }

  @Post('matches/:id/respond')
  async respond(@Param('id') id: string, @Body() dto: RespondMatchDto, @Req() req: AuthedRequest) {
    const { request, accepted } = await this.matches.respond(req.user.id, id, dto.accept)
    if (!accepted) return { status: request.status }

    const requester = (await this.users.getById(request.from_user)) as UserRow | null
    if (!requester) return { status: request.status }
    await this.bot.notify(
      requester.tg_id,
      tf(requester.ui_lang ?? 'uz', 'match_accepted', {
        name: req.user.first_name,
        contact: contactOf(req.user),
      }),
    )
    return { status: request.status, contact: contactOf(requester) }
  }
}
