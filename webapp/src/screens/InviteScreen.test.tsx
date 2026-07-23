import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import InviteScreen from './InviteScreen'

const summary = {
  code: 'abc123',
  link: 'https://t.me/usefull_bot?start=ref_abc123',
  invitedCount: 0,
  daysEarned: 0,
  nextMilestone: { friends: 2, days: 1, remaining: 2 },
  invited: [],
}

const apiMock = vi.fn(async (_path: string) => summary)
vi.mock('../api', () => ({ api: (...a: unknown[]) => apiMock(...(a as [string])) }))

const openLink = vi.fn()
vi.mock('../telegram', () => ({ tg: { openTelegramLink: (...a: unknown[]) => openLink(...a) } }))

describe('InviteScreen', () => {
  beforeEach(() => {
    apiMock.mockClear()
    openLink.mockClear()
  })

  it('shows progress and the invite link', async () => {
    render(<InviteScreen />)
    await waitFor(() => expect(screen.getByText(/0 days of Premium/i)).toBeInTheDocument())
    expect(screen.getByText(/t.me\/usefull_bot/)).toBeInTheDocument()
    expect(apiMock).toHaveBeenCalledWith('/api/referrals/me')
  })

  it('shares the invite link via Telegram', async () => {
    render(<InviteScreen />)
    await waitFor(() => screen.getByText(/Share invite link/i))
    fireEvent.click(screen.getByText(/Share invite link/i))
    await waitFor(() => expect(openLink).toHaveBeenCalled())
  })
})
