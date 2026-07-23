import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { APP_CONFIG } from '../config/config.module'
import { Config } from '../config/configuration'
import { ReferralsService } from './referrals.service'

interface AuthedRequest {
  user: { id: string }
}

@Controller('api/referrals')
@UseGuards(TelegramAuthGuard)
export class ReferralsController {
  constructor(
    private readonly referrals: ReferralsService,
    @Inject(APP_CONFIG) private readonly config: Config,
  ) {}

  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.referrals.summary(req.user.id, this.config.botUsername ?? '')
  }
}
