import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import BankScreen from './BankScreen'

const questions = [
  { id: '1', part: 'Part 1', topic: 'Hometown', question: 'Where are you from?', published_at: '2026-07-20T00:00:00Z' },
]

vi.mock('../api', () => ({
  api: vi.fn(async (path: string) => (path.includes('part=') ? [] : questions)),
}))

import { api } from '../api'

describe('BankScreen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and renders questions', async () => {
    render(<BankScreen />)
    await waitFor(() => expect(screen.getByText('Where are you from?')).toBeInTheDocument())
    expect(api).toHaveBeenCalledWith('/api/exam-questions')
  })

  it('filters by part via chips', async () => {
    render(<BankScreen />)
    await waitFor(() => screen.getByText('Where are you from?'))
    fireEvent.click(screen.getByText('Part 2'))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/api/exam-questions?part=Part%202'),
    )
  })
})
