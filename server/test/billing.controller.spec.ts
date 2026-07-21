import { BillingController } from '../src/billing/billing.controller'

type InvoiceArgs = [string, string, string, string, string, Array<{ label: string; amount: number }>]

describe('BillingController', () => {
  it('creates an XTR invoice link for the requested tier', async () => {
    const bot = {
      bot: { api: { createInvoiceLink: jest.fn<Promise<string>, InvoiceArgs>(async () => 'https://t.me/$abc') } },
    }
    const config = { premiumStars: 350, goldStars: 1000 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctrl = new BillingController(bot as any, config as any)
    const result = await ctrl.invoice({ tier: 'gold' })
    expect(result).toEqual({ link: 'https://t.me/$abc' })
    const args = bot.bot.api.createInvoiceLink.mock.calls[0]
    expect(args[4]).toBe('XTR')
    expect(args[5]).toEqual([{ label: 'Gold', amount: 1000 }])
    expect(JSON.parse(args[2])).toEqual({ tier: 'gold' })
  })
})
