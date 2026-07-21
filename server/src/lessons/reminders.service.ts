import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { BotService } from '../bot/bot.service'
import { tf, UiLang } from '../i18n/i18n'
import { BookingsService } from './bookings.service'

const fmt = (iso: string) => new Date(iso).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name)

  constructor(
    private readonly bookings: BookingsService,
    private readonly bot: BotService,
  ) {}

  @Cron('*/10 * * * *')
  async tick(): Promise<void> {
    for (const hours of [24, 1] as const) {
      const due = await this.bookings.dueReminders(hours).catch((err) => {
        this.logger.error(`dueReminders(${hours}) failed: ${String(err)}`)
        return []
      })
      for (const b of due) {
        const time = fmt(b.slot.starts_at)
        const teacher = b.slot.teacher?.user
        if (b.learner?.tg_id) {
          await this.bot.notify(
            b.learner.tg_id,
            tf((b.learner.ui_lang as UiLang) ?? 'uz', 'reminder', { name: teacher?.first_name ?? '?', time }),
          )
        }
        if (teacher?.tg_id) {
          await this.bot.notify(
            teacher.tg_id,
            tf((teacher.ui_lang as UiLang) ?? 'uz', 'reminder', { name: b.learner?.first_name ?? '?', time }),
          )
        }
        await this.bookings.markReminded(b.id, hours)
      }
    }
  }
}
