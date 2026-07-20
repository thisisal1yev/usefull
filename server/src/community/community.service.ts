import { Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

@Injectable()
export class CommunityService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async listQuestions() {
    const { data, error } = await this.db
      .from('community_questions')
      .select()
      .eq('is_removed', false)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data
  }

  async createQuestion(body: string, userId: string) {
    const { data, error } = await this.db
      .from('community_questions')
      .insert({ body, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async listAnswers(questionId: string) {
    const { data, error } = await this.db
      .from('answers')
      .select()
      .eq('question_id', questionId)
      .eq('is_removed', false)
      .order('created_at', { ascending: true })
      .limit(100)
    if (error) throw error
    return data
  }

  async createAnswer(questionId: string, body: string, userId: string) {
    const { data, error } = await this.db
      .from('answers')
      .insert({ question_id: questionId, body, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }
}
