import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { ProfileService } from './profile.service'

interface AuthedRequest {
  user: { id: string }
}

@Controller('api/profile')
@UseGuards(TelegramAuthGuard)
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  overview(@Req() req: AuthedRequest) {
    return this.profile.overview(req.user.id)
  }
}
