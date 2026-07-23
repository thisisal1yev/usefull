import { Module } from '@nestjs/common'
import { BillingService } from '../billing/billing.service'
import { ReferralsService } from '../referrals/referrals.service'
import { TeachersModule } from '../teachers/teachers.module'
import { UsersModule } from '../users/users.module'
import { BotService } from './bot.service'

@Module({
  imports: [UsersModule, TeachersModule],
  providers: [BotService, BillingService, ReferralsService],
  exports: [BotService],
})
export class BotModule {}
