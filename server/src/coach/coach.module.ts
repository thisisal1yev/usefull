import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BotModule } from '../bot/bot.module'
import { CoachController } from './coach.controller'
import { CoachService } from './coach.service'

@Module({
  imports: [AuthModule, BotModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}
