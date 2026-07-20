import { Module } from '@nestjs/common'
import { AppConfigModule } from './config/config.module'
import { DbModule } from './db/db.module'
import { UsersModule } from './users/users.module'
import { BotModule } from './bot/bot.module'
import { AuthModule } from './auth/auth.module'
import { ExamQuestionsModule } from './exam-questions/exam-questions.module'
import { CommunityModule } from './community/community.module'
import { MatchesModule } from './matches/matches.module'
import { HealthController } from './health/health.controller'

@Module({
  imports: [
    AppConfigModule, DbModule, UsersModule, BotModule,
    AuthModule, ExamQuestionsModule, CommunityModule, MatchesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
