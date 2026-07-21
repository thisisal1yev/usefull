import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { BotService } from '../bot/bot.service'
import { tf, UiLang } from '../i18n/i18n'
import { BookingsService } from './bookings.service'
import { CreateBookingDto } from './dto/create-booking.dto'

interface UserRow {
  id: string
  first_name: string
  tg_id: number
  ui_lang: string
  plan: string
}

interface AuthedRequest {
  user: UserRow
}

const fmt = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

@Controller('api/bookings')
@UseGuards(TelegramAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly bot: BotService,
  ) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @Req() req: AuthedRequest) {
    const { booking, slot } = await this.bookings.book(
      { id: req.user.id, plan: req.user.plan },
      dto.slotId,
    )
    const teacher = slot.teacher?.user
    const time = fmt(slot.starts_at)
    await this.bot.notify(
      req.user.tg_id,
      tf((req.user.ui_lang as UiLang) ?? 'uz', 'booking_confirmed', { name: teacher?.first_name ?? '?', time }),
    )
    if (teacher?.tg_id) {
      await this.bot.notify(
        teacher.tg_id,
        tf((teacher.ui_lang as UiLang) ?? 'uz', 'booking_new_for_teacher', {
          name: req.user.first_name, time,
        }),
      )
    }
    return booking
  }

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.bookings.myBookings(req.user.id)
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    const { booking, slot, cancelledBy } = await this.bookings.cancel(req.user.id, id)
    const time = fmt(slot.starts_at)
    const other = cancelledBy === 'learner' ? slot.teacher?.user : booking.learner
    if (other?.tg_id) {
      await this.bot.notify(
        other.tg_id,
        tf((other.ui_lang as UiLang) ?? 'uz', 'booking_cancelled', {
          name: req.user.first_name, time,
        }),
      )
    }
    return { deleted: true }
  }
}
