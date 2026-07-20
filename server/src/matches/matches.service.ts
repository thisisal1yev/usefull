import {
  BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException,
} from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

export interface Candidate {
  id: string
  first_name: string
  username: string | null
  level: string | null
  goal: string | null
  availability: string | null
}

const CANDIDATE_FIELDS = 'id, first_name, username, level, goal, availability'
const EMBED = `*, from:users!match_requests_from_user_fkey(${CANDIDATE_FIELDS}), to:users!match_requests_to_user_fkey(${CANDIDATE_FIELDS})`

@Injectable()
export class MatchesService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async listCandidates(meId: string, level?: string): Promise<Candidate[]> {
    let q = this.db
      .from('users')
      .select(CANDIDATE_FIELDS)
      .eq('onboarded', true)
      .neq('id', meId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (level) q = q.eq('level', level)
    const { data, error } = await q
    if (error) throw error
    return data as Candidate[]
  }

  async createRequest(fromId: string, toId: string) {
    if (fromId === toId) throw new BadRequestException('Cannot request yourself')
    const { data, error } = await this.db
      .from('match_requests')
      .insert({ from_user: fromId, to_user: toId })
      .select()
      .single()
    if (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Request already exists')
      }
      throw error
    }
    return data
  }

  async listRequests(meId: string) {
    const incoming = await this.db
      .from('match_requests')
      .select(EMBED)
      .eq('to_user', meId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (incoming.error) throw incoming.error
    const outgoing = await this.db
      .from('match_requests')
      .select(EMBED)
      .eq('from_user', meId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (outgoing.error) throw outgoing.error
    return { incoming: incoming.data, outgoing: outgoing.data }
  }

  async respond(meId: string, requestId: string, accept: boolean) {
    const { data: request, error } = await this.db
      .from('match_requests')
      .select()
      .eq('id', requestId)
      .maybeSingle()
    if (error) throw error
    if (!request) throw new NotFoundException('Request not found')
    if (request.to_user !== meId) throw new ForbiddenException('Not your request')
    if (request.status !== 'pending') throw new ConflictException('Already answered')

    const { data: updated, error: updError } = await this.db
      .from('match_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId)
      .select()
      .single()
    if (updError) throw updError
    return { request: updated, accepted: accept }
  }
}
