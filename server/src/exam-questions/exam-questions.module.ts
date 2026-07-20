import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ExamQuestionsController } from './exam-questions.controller'
import { ExamQuestionsService } from './exam-questions.service'

@Module({
  imports: [AuthModule],
  controllers: [ExamQuestionsController],
  providers: [ExamQuestionsService],
})
export class ExamQuestionsModule {}
