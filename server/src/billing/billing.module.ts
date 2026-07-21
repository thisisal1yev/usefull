import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BotModule } from '../bot/bot.module'
import { BillingController } from './billing.controller'
import { BillingCronService } from './billing-cron.service'
import { BillingService } from './billing.service'

@Module({
  imports: [AuthModule, BotModule],
  controllers: [BillingController],
  providers: [BillingService, BillingCronService],
  exports: [BillingService],
})
export class BillingModule {}
