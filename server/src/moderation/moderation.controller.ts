import { Body, Controller, ForbiddenException, Get, Post, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { CreateReportDto } from './dto/create-report.dto'
import { ModerateDto } from './dto/moderate.dto'
import { ModerationService } from './moderation.service'

interface AuthedRequest {
  user: { id: string; role: string }
}

@Controller('api')
@UseGuards(TelegramAuthGuard)
export class ModerationController {
  constructor(private readonly moderation: ModerationService) {}

  @Post('report')
  report(@Body() dto: CreateReportDto, @Req() req: AuthedRequest) {
    return this.moderation.report(req.user.id, dto.targetType, dto.targetId)
  }

  @Get('admin/reports')
  reports(@Req() req: AuthedRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only')
    return this.moderation.listReported()
  }

  @Post('admin/moderate')
  moderate(@Body() dto: ModerateDto, @Req() req: AuthedRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only')
    return this.moderation.remove(dto.targetType, dto.targetId)
  }
}
