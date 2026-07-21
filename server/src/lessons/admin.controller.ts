import {
  Body, Controller, ForbiddenException, Get, Param, Post, Query, Req, UseGuards,
} from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { BotService } from '../bot/bot.service'
import { t, UiLang } from '../i18n/i18n'
import { TeachersService } from '../teachers/teachers.service'
import { UsersService } from '../users/users.service'
import { SetTeacherStatusDto } from './dto/set-teacher-status.dto'

interface AuthedRequest {
  user: { id: string; role: string }
}

@Controller('api/admin')
@UseGuards(TelegramAuthGuard)
export class AdminController {
  constructor(
    private readonly teachers: TeachersService,
    private readonly users: UsersService,
    private readonly bot: BotService,
  ) {}

  private assertAdmin(req: AuthedRequest): void {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only')
  }

  @Get('teachers')
  list(@Req() req: AuthedRequest, @Query('status') status?: string) {
    this.assertAdmin(req)
    return this.teachers.listByStatus(
      (status as 'pending' | 'approved' | 'rejected') ?? 'pending',
    )
  }

  @Post('teachers/:userId/status')
  async setStatus(
    @Param('userId') userId: string,
    @Body() dto: SetTeacherStatusDto,
    @Req() req: AuthedRequest,
  ) {
    this.assertAdmin(req)
    const updated = await this.teachers.setStatus(userId, dto.status)
    const applicant = await this.users.getById(userId)
    if (applicant?.tg_id) {
      await this.bot.notify(
        applicant.tg_id,
        t((applicant.ui_lang as UiLang) ?? 'uz', dto.status === 'approved' ? 'teacher_approved' : 'teacher_rejected'),
      )
    }
    return updated
  }
}
