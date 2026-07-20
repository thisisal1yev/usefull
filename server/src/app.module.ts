import { Module } from '@nestjs/common'
import { AppConfigModule } from './config/config.module'
import { DbModule } from './db/db.module'
import { UsersModule } from './users/users.module'
import { BotModule } from './bot/bot.module'
import { HealthController } from './health/health.controller'

@Module({
  imports: [AppConfigModule, DbModule, UsersModule, BotModule],
  controllers: [HealthController],
})
export class AppModule {}
