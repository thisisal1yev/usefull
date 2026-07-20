import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { TelegramAuthGuard } from '../auth/telegram-auth.guard'
import { CommunityService } from './community.service'
import { CreateAnswerDto } from './dto/create-answer.dto'
import { CreateQuestionDto } from './dto/create-question.dto'

interface AuthedRequest {
  user: { id: string }
}

@Controller('api/questions')
@UseGuards(TelegramAuthGuard)
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @Get()
  list() {
    return this.service.listQuestions()
  }

  @Post()
  create(@Body() dto: CreateQuestionDto, @Req() req: AuthedRequest) {
    return this.service.createQuestion(dto.body, req.user.id)
  }

  @Get(':id/answers')
  answers(@Param('id') id: string) {
    return this.service.listAnswers(id)
  }

  @Post(':id/answers')
  answer(@Param('id') id: string, @Body() dto: CreateAnswerDto, @Req() req: AuthedRequest) {
    return this.service.createAnswer(id, dto.body, req.user.id)
  }
}
