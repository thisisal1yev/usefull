import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'

@Controller('api/me')
@UseGuards(TelegramAuthGuard)
export class MeController {
  @Get()
  me(@Req() req: { user: unknown }) {
    return req.user
  }
}
