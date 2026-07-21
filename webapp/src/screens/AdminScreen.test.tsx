import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AdminScreen from './AdminScreen'

const pending = [
  {
    user_id: 'u9', bio: 'IELTS teacher, 6 years', experience: '6 years', certificates_url: null,
    user: { first_name: 'Karim', username: 'karim' },
  },
]

const apiMock = vi.fn(async (path: string, init?: RequestInit) => {
  if (init?.method === 'POST') return { user_id: 'u9', status: 'approved' }
  return pending
})

vi.mock('../api', () => ({ api: (...args: unknown[]) => apiMock(...(args as [string, RequestInit?])) }))

describe('AdminScreen', () => {
  beforeEach(() => apiMock.mockClear())

  it('lists pending applications', async () => {
    render(<AdminScreen />)
    await waitFor(() => expect(screen.getByText('Karim')).toBeInTheDocument())
    expect(apiMock).toHaveBeenCalledWith('/api/admin/teachers?status=pending')
  })

  it('approves an application and removes it from the list', async () => {
    render(<AdminScreen />)
    await waitFor(() => screen.getByText('Karim'))
    fireEvent.click(screen.getByText('Tasdiqlash'))
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith(
        '/api/admin/teachers/u9/status',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    await waitFor(() => expect(screen.queryByText('Karim')).not.toBeInTheDocument())
  })
})
