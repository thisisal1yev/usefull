import {
  CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { APP_CONFIG } from '../config/config.module'
import { Config } from '../config/configuration'
import { UsersService } from '../users/users.service'
import { validateInitData } from './init-data'

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    @Inject(APP_CONFIG) private readonly config: Config,
    private readonly users: UsersService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: unknown }>()
    const initData = req.header('x-telegram-init-data')
    const tgUser = initData ? validateInitData(initData, this.config.botToken) : null
    if (!tgUser) throw new UnauthorizedException('Invalid Telegram init data')
    req.user = await this.users.upsertFromTelegram({
      id: tgUser.id,
      first_name: tgUser.first_name,
      username: tgUser.username,
    })
    return true
  }
}
