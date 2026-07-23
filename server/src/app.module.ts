import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AppConfigModule } from './config/config.module'
import { DbModule } from './db/db.module'
import { UsersModule } from './users/users.module'
import { BotModule } from './bot/bot.module'
import { AuthModule } from './auth/auth.module'
import { ExamQuestionsModule } from './exam-questions/exam-questions.module'
import { CommunityModule } from './community/community.module'
import { MatchesModule } from './matches/matches.module'
import { LessonsModule } from './lessons/lessons.module'
import { BillingModule } from './billing/billing.module'
import { CoachModule } from './coach/coach.module'
import { ModerationModule } from './moderation/moderation.module'
import { ReferralsModule } from './referrals/referrals.module'
import { HealthController } from './health/health.controller'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppConfigModule, DbModule, UsersModule, BotModule,
    AuthModule, ExamQuestionsModule, CommunityModule, MatchesModule,
    LessonsModule, BillingModule, CoachModule, ModerationModule,
    ReferralsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
