import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { BotModule } from '../bot/bot.module'
import { TeachersModule } from '../teachers/teachers.module'
import { AdminController } from './admin.controller'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { RemindersService } from './reminders.service'
import { TeachersController } from './teachers.controller'

@Module({
  imports: [AuthModule, BotModule, TeachersModule],
  controllers: [TeachersController, BookingsController, AdminController],
  providers: [BookingsService, RemindersService],
})
export class LessonsModule {}
