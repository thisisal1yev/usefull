import {
  Body, Controller, Delete, ForbiddenException, Get, Param, Post, Req, UseGuards,
} from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { TeachersService } from '../teachers/teachers.service'
import { ApplyTeacherDto } from './dto/apply-teacher.dto'
import { CreateSlotDto } from './dto/create-slot.dto'

interface AuthedRequest {
  user: { id: string; role: string }
}

@Controller('api')
@UseGuards(TelegramAuthGuard)
export class TeachersController {
  constructor(private readonly teachers: TeachersService) {}

  @Get('teachers')
  list() {
    return this.teachers.listApproved()
  }

  @Post('teachers/apply')
  apply(@Body() dto: ApplyTeacherDto, @Req() req: AuthedRequest) {
    return this.teachers.apply(req.user.id, dto)
  }

  @Get('teachers/me')
  me(@Req() req: AuthedRequest) {
    return this.teachers.myProfile(req.user.id)
  }

  @Get('teachers/:id/slots')
  slots(@Param('id') id: string) {
    return this.teachers.availableSlots(id)
  }

  @Post('slots')
  async createSlot(@Body() dto: CreateSlotDto, @Req() req: AuthedRequest) {
    const profile = await this.teachers.myProfile(req.user.id)
    if (profile?.status !== 'approved') throw new ForbiddenException('Not an approved teacher')
    return this.teachers.createSlot(req.user.id, new Date(dto.startsAt))
  }

  @Get('slots/mine')
  mySlots(@Req() req: AuthedRequest) {
    return this.teachers.mySlots(req.user.id)
  }

  @Delete('slots/:id')
  removeSlot(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.teachers.deleteSlot(req.user.id, id)
  }
}
