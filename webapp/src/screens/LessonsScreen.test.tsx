import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import LessonsScreen from './LessonsScreen'

const teachers = [
  { user_id: 't1', bio: 'IELTS pro', status: 'approved', user: { id: 't1', first_name: 'Aziz', username: 'aziz' } },
]
const slots = [{ id: 's1', teacher_id: 't1', starts_at: '2026-08-01T18:00:00Z', ends_at: '2026-08-01T19:00:00Z' }]

const apiMock = vi.fn(async (path: string, init?: RequestInit) => {
  if (path === '/api/teachers') return teachers
  if (path === '/api/teachers/me') return null
  if (path === '/api/bookings' && !init) return []
  if (path.endsWith('/slots')) return slots
  if (init?.method === 'POST') return { id: 'b1' }
  return []
})

vi.mock('../api', () => ({ api: (...args: unknown[]) => apiMock(...(args as [string, RequestInit?])) }))

describe('LessonsScreen', () => {
  beforeEach(() => {
    apiMock.mockClear()
  })

  it('lists approved teachers', async () => {
    render(<LessonsScreen />)
    await waitFor(() => expect(screen.getByText('Aziz')).toBeInTheDocument())
  })

  it('opens teacher slots and books one', async () => {
    render(<LessonsScreen />)
    await waitFor(() => screen.getByText('Aziz'))
    fireEvent.click(screen.getByText('Aziz'))
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/api/teachers/t1/slots'))
    const bookBtn = await screen.findByText('Band qilish')
    fireEvent.click(bookBtn)
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith('/api/bookings', expect.objectContaining({ method: 'POST' })),
    )
  })
})
