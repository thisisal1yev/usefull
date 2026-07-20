import { Module } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { MeController } from './me.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [MeController],
  providers: [UsersService, TelegramAuthGuard],
  exports: [UsersService],
})
export class UsersModule {}
