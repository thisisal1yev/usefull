import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import SpeakingScreen from './SpeakingScreen'

const apiMock = vi.fn(async (path: string) => {
  if (path.startsWith('/api/matches')) return { incoming: [], outgoing: [] }
  return []
})

vi.mock('../api', () => ({ api: (...a: unknown[]) => apiMock(...(a as [string])) }))

describe('SpeakingScreen', () => {
  beforeEach(() => {
    apiMock.mockClear()
  })

  it('shows the partner catalog by default', async () => {
    render(<SpeakingScreen />)
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/api/partners'))
  })

  it('switches to requests', async () => {
    render(<SpeakingScreen />)
    fireEvent.click(screen.getByText('requests'))
    await waitFor(() => expect(apiMock).toHaveBeenCalledWith('/api/matches'))
  })
})
