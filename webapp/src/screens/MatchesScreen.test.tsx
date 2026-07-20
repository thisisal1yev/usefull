import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import MatchesScreen from './MatchesScreen'

const data = {
  incoming: [
    {
      id: 'm1', status: 'pending', created_at: '2026-07-20T00:00:00Z',
      from: { id: 'u1', first_name: 'Ali', username: null, level: 'B2' },
      to: { id: 'u2', first_name: 'Bek', username: 'bek', level: 'B1' },
    },
  ],
  outgoing: [
    {
      id: 'm2', status: 'accepted', created_at: '2026-07-20T00:00:00Z',
      from: { id: 'u2', first_name: 'Bek', username: 'bek', level: 'B1' },
      to: { id: 'u3', first_name: 'Zilola', username: 'zilola', level: 'C1' },
    },
  ],
}

vi.mock('../api', () => ({
  api: vi.fn(async (path: string, init?: RequestInit) => {
    if (init?.method === 'POST') return { status: 'accepted', contact: '@ali' }
    return data
  }),
}))

import { api } from '../api'

describe('MatchesScreen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders incoming and outgoing sections', async () => {
    render(<MatchesScreen />)
    await waitFor(() => expect(screen.getByText('Ali')).toBeInTheDocument())
    expect(screen.getByText('Zilola')).toBeInTheDocument()
    expect(api).toHaveBeenCalledWith('/api/matches')
  })

  it('accepts an incoming request and shows the contact', async () => {
    render(<MatchesScreen />)
    await waitFor(() => screen.getByText('Ali'))
    fireEvent.click(screen.getByText('Qabul qilish'))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/api/matches/m1/respond', expect.objectContaining({ method: 'POST' })),
    )
    await waitFor(() => expect(screen.getByText('@ali')).toBeInTheDocument())
  })
})
