import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import QaScreen from './QaScreen'

const questions = [{ id: 'c1', body: 'How to improve fluency?', created_at: '2026-07-20T00:00:00Z' }]
const answers = [{ id: 'a1', body: 'Practice daily', created_at: '2026-07-20T01:00:00Z' }]

vi.mock('../api', () => ({
  api: vi.fn(async (path: string, init?: RequestInit) => {
    if (path === '/api/report') return { result: 'reported' }
    if (init?.method === 'POST') return { id: 'new' }
    if (path.endsWith('/answers')) return answers
    return questions
  }),
}))

import { api } from '../api'

describe('QaScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the questions feed', async () => {
    render(<QaScreen />)
    await waitFor(() => expect(screen.getByText('How to improve fluency?')).toBeInTheDocument())
    expect(api).toHaveBeenCalledWith('/api/questions')
  })

  it('opens a question and shows answers', async () => {
    render(<QaScreen />)
    await waitFor(() => screen.getByText('How to improve fluency?'))
    fireEvent.click(screen.getByText('How to improve fluency?'))
    await waitFor(() => expect(screen.getByText('Practice daily')).toBeInTheDocument())
    expect(api).toHaveBeenCalledWith('/api/questions/c1/answers')
  })

  it('posts a new question', async () => {
    render(<QaScreen />)
    await waitFor(() => screen.getByText('How to improve fluency?'))
    fireEvent.change(screen.getByPlaceholderText(/savol/i), { target: { value: 'What about idioms?' } })
    fireEvent.click(screen.getByText(/yuborish/i))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/api/questions', expect.objectContaining({ method: 'POST' })),
    )
  })

  it('reports a question', async () => {
    render(<QaScreen />)
    await waitFor(() => screen.getByText('How to improve fluency?'))
    fireEvent.click(screen.getAllByText('Shikoyat')[0])
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/api/report', expect.objectContaining({ method: 'POST' })),
    )
  })
})
