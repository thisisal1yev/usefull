interface TelegramWebApp {
  initData: string
  ready: () => void
  expand: () => void
  colorScheme?: 'light' | 'dark'
  openInvoice?: (url: string, callback?: (status: string) => void) => void
  openTelegramLink?: (url: string) => void
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp }
  }
}

export const tg: TelegramWebApp = {
  get initData() {
    return window.Telegram?.WebApp.initData ?? ''
  },
  get colorScheme() {
    return window.Telegram?.WebApp.colorScheme
  },
  ready: () => window.Telegram?.WebApp.ready(),
  expand: () => window.Telegram?.WebApp.expand(),
  openInvoice: (url: string, callback?: (status: string) => void) =>
    window.Telegram?.WebApp.openInvoice?.(url, callback),
  openTelegramLink: (url: string) => window.Telegram?.WebApp.openTelegramLink?.(url),
}
