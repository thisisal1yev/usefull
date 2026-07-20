import 'dotenv/config'

export interface Config {
  botToken: string
  supabaseUrl: string
  supabaseServiceRoleKey: string
  botMode: 'polling' | 'webhook'
  port: number
  webhookSecret: string | undefined
  webappUrl: string | undefined
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const required = (name: string): string => {
    const v = env[name]
    if (!v) throw new Error(`Missing env var: ${name}`)
    return v
  }
  return {
    botToken: required('BOT_TOKEN'),
    supabaseUrl: required('SUPABASE_URL'),
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    botMode: env.BOT_MODE === 'webhook' ? 'webhook' : 'polling',
    port: Number(env.PORT ?? 3000),
    webhookSecret: env.WEBHOOK_SECRET || undefined,
    webappUrl: env.WEBAPP_URL || undefined,
  }
}
