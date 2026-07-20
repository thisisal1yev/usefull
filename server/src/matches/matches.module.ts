import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BotModule } from '../bot/bot.module'
import { MatchesController } from './matches.controller'
import { MatchesService } from './matches.service'

@Module({
  imports: [AuthModule, BotModule],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
