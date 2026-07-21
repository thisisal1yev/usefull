import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { BotService } from '../bot/bot.service'
import { APP_CONFIG } from '../config/config.module'
import { Config } from '../config/configuration'
import { CreateInvoiceDto } from './dto/create-invoice.dto'

const TITLES = { premium: 'Premium', gold: 'Gold' } as const
const DESCRIPTIONS = {
  premium: 'usfull Premium — 3 lessons per week, 30 days',
  gold: 'usfull Gold — Premium + personal coach, 30 days',
} as const

@Controller('api/billing')
@UseGuards(TelegramAuthGuard)
export class BillingController {
  constructor(
    private readonly bot: BotService,
    @Inject(APP_CONFIG) private readonly config: Config,
  ) {}

  @Post('invoice')
  async invoice(@Body() dto: CreateInvoiceDto) {
    const amount = dto.tier === 'gold' ? this.config.goldStars : this.config.premiumStars
    const link = await this.bot.bot.api.createInvoiceLink(
      TITLES[dto.tier],
      DESCRIPTIONS[dto.tier],
      JSON.stringify({ tier: dto.tier }),
      '',
      'XTR',
      [{ label: TITLES[dto.tier], amount }],
    )
    return { link }
  }
}
