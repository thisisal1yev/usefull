import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { CreateExamQuestionDto } from './dto/create-exam-question.dto'
import { ExamQuestionsService, Author } from './exam-questions.service'

@Controller('api/exam-questions')
@UseGuards(TelegramAuthGuard)
export class ExamQuestionsController {
  constructor(private readonly service: ExamQuestionsService) {}

  @Get()
  list(@Query('part') part?: string) {
    return this.service.list(part)
  }

  @Post()
  create(@Body() dto: CreateExamQuestionDto, @Req() req: { user: Author }) {
    return this.service.create(dto, req.user)
  }
}
