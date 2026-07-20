import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import PartnersScreen from './PartnersScreen'

const candidates = [
  { id: 'u2', first_name: 'Bek', username: 'bek', level: 'B1', goal: 'ielts', availability: 'evening' },
]

vi.mock('../api', () => ({
  api: vi.fn(async (path: string, init?: RequestInit) => {
    if (init?.method === 'POST') return { id: 'm1' }
    return candidates
  }),
}))

import { api } from '../api'

describe('PartnersScreen', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders candidates', async () => {
    render(<PartnersScreen />)
    await waitFor(() => expect(screen.getByText('Bek')).toBeInTheDocument())
    expect(api).toHaveBeenCalledWith('/api/partners')
  })

  it('filters by level', async () => {
    render(<PartnersScreen />)
    await waitFor(() => screen.getByText('Bek'))
    fireEvent.click(screen.getByText('B2'))
    await waitFor(() => expect(api).toHaveBeenCalledWith('/api/partners?level=B2'))
  })

  it('sends a match request and marks the card', async () => {
    render(<PartnersScreen />)
    await waitFor(() => screen.getByText('Bek'))
    fireEvent.click(screen.getByText("So'rov yuborish"))
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith('/api/matches', expect.objectContaining({ method: 'POST' })),
    )
    await waitFor(() => expect(screen.getByText('Yuborildi ✓')).toBeInTheDocument())
  })
})
