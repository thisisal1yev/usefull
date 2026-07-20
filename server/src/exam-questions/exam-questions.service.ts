import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'
import { CreateExamQuestionDto } from './dto/create-exam-question.dto'

export interface Author {
  id: string
  role: string
}

@Injectable()
export class ExamQuestionsService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async list(part?: string) {
    let q = this.db
      .from('exam_questions')
      .select()
      .order('published_at', { ascending: false })
      .limit(50)
    if (part) q = q.eq('part', part)
    const { data, error } = await q
    if (error) throw error
    return data
  }

  async create(dto: CreateExamQuestionDto, author: Author) {
    if (author.role !== 'teacher' && author.role !== 'admin') {
      throw new ForbiddenException('Only teachers and admins can publish questions')
    }
    const { data, error } = await this.db
      .from('exam_questions')
      .insert({ part: dto.part, topic: dto.topic, question: dto.question, author_id: author.id })
      .select()
      .single()
    if (error) throw error
    return data
  }
}
