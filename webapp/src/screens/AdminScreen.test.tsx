import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import AdminScreen from './AdminScreen'

const pending = [
  {
    user_id: 'u9', bio: 'IELTS teacher, 6 years', experience: '6 years', certificates_url: null,
    user: { first_name: 'Karim', username: 'karim' },
  },
]

const goldUsers = [{ id: 'g1', first_name: 'Gulnora', username: 'gulnora' }]

const apiMock = vi.fn(async (path: string, init?: RequestInit) => {
  if (init?.method === 'POST') return { user_id: 'u9', status: 'approved' }
  if (path === '/api/admin/gold') return goldUsers
  if (path === '/api/admin/reports') return { questions: [{ id: 'q1', body: 'bad question', reports: 2 }], answers: [] }
  return pending
})

vi.mock('../api', () => ({ api: (...args: unknown[]) => apiMock(...(args as [string, RequestInit?])) }))

describe('AdminScreen', () => {
  beforeEach(() => { apiMock.mockClear() })

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

  it('lists gold users needing a coach', async () => {
    render(<AdminScreen />)
    await waitFor(() => expect(screen.getByText('Gulnora')).toBeInTheDocument())
  })

  it('assigns a coach', async () => {
    render(<AdminScreen />)
    await waitFor(() => screen.getByText('Gulnora'))
    fireEvent.change(screen.getByPlaceholderText(/murabbiy/i), { target: { value: '@coach1' } })
    fireEvent.click(screen.getByText('Biriktirish'))
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith('/api/admin/coach', expect.objectContaining({ method: 'POST' })),
    )
    await waitFor(() => expect(screen.queryByText('Gulnora')).not.toBeInTheDocument())
  })

  it('lists reported content and removes it', async () => {
    render(<AdminScreen />)
    await waitFor(() => expect(screen.getByText('bad question')).toBeInTheDocument())
    fireEvent.click(screen.getByText("O'chirish"))
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith('/api/admin/moderate', expect.objectContaining({ method: 'POST' })),
    )
    await waitFor(() => expect(screen.queryByText('bad question')).not.toBeInTheDocument())
  })

  it('publishes an exam question', async () => {
    render(<AdminScreen />)
    await waitFor(() => screen.getByText(/Savol qo/))
    fireEvent.change(screen.getByPlaceholderText(/savol matni/i), {
      target: { value: 'Describe your favourite book.' },
    })
    fireEvent.click(screen.getByText("Qo'shish"))
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith('/api/exam-questions', expect.objectContaining({ method: 'POST' })),
    )
  })
})
