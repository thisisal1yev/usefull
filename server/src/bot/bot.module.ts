import { Module } from '@nestjs/common'
import { TeachersModule } from '../teachers/teachers.module'
import { UsersModule } from '../users/users.module'
import { BotService } from './bot.service'

@Module({
  imports: [UsersModule, TeachersModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
