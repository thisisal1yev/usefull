import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { TelegramAuthGuard } from './telegram-auth.guard'

@Module({
  imports: [UsersModule],
  providers: [TelegramAuthGuard],
  exports: [TelegramAuthGuard, UsersModule],
})
export class AuthModule {}
