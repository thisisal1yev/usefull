import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ProfileScreen from './ProfileScreen'

const me = { first_name: '愛', plan: 'free', plan_expires_at: null, role: 'learner' }
const overview = { streak: 3, progress: { lessons: 2, partners: 1 }, history: [] }

const apiMock = vi.fn(async (path: string, init?: RequestInit) => {
  if (path === '/api/billing/invoice' || init?.method === 'POST') return { link: 'https://t.me/$inv' }
  if (path === '/api/profile') return overview
  return me
})

vi.mock('../api', () => ({ api: (...args: unknown[]) => apiMock(...(args as [string, RequestInit?])) }))

const openInvoice = vi.fn()
vi.mock('../telegram', () => ({ tg: { openInvoice: (...a: unknown[]) => openInvoice(...a) } }))

describe('ProfileScreen', () => {
  beforeEach(() => {
    apiMock.mockClear()
    openInvoice.mockClear()
  })

  it('shows plan info', async () => {
    render(<ProfileScreen />)
    await waitFor(() => expect(screen.getByText('Free')).toBeInTheDocument())
    expect(apiMock).toHaveBeenCalledWith('/api/me')
  })

  it('requests an invoice link and opens it', async () => {
    render(<ProfileScreen />)
    await waitFor(() => screen.getByText('Free'))
    fireEvent.click(screen.getByText(/Premium olish/))
    await waitFor(() =>
      expect(apiMock).toHaveBeenCalledWith('/api/billing/invoice', expect.objectContaining({ method: 'POST' })),
    )
    await waitFor(() => expect(openInvoice).toHaveBeenCalledWith('https://t.me/$inv', expect.any(Function)))
  })

  it('shows the streak and progress', async () => {
    render(<ProfileScreen />)
    await waitFor(() => expect(screen.getByText(/3 kunlik seriya/)).toBeInTheDocument())
    expect(apiMock).toHaveBeenCalledWith('/api/profile')
  })
})
