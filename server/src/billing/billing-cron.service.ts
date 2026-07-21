import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { BotService } from '../bot/bot.service'
import { t, UiLang } from '../i18n/i18n'
import { BillingService } from './billing.service'

@Injectable()
export class BillingCronService {
  private readonly logger = new Logger(BillingCronService.name)

  constructor(
    private readonly billing: BillingService,
    private readonly bot: BotService,
  ) {}

  @Cron('0 * * * *')
  async tick(): Promise<void> {
    const expired = await this.billing.expireOverdue().catch((err) => {
      this.logger.error(`expireOverdue failed: ${String(err)}`)
      return []
    })
    for (const u of expired) {
      await this.bot.notify(u.tg_id, t((u.ui_lang as UiLang) ?? 'uz', 'plan_expired'))
    }
  }
}
