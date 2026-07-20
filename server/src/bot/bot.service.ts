import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { Bot, Context, InlineKeyboard, session, SessionFlavor } from 'grammy'
import { APP_CONFIG } from '../config/config.module'
import { Config } from '../config/configuration'
import { t, UiLang } from '../i18n/i18n'
import {
  initialState, applyInput, LEVELS, GOALS, AVAILABILITIES, OnboardingState,
} from '../onboarding/machine'
import { UsersService } from '../users/users.service'

interface SessionData {
  onboarding: OnboardingState
}

export type BotContext = Context & SessionFlavor<SessionData>

const langKeyboard = new InlineKeyboard().text("O'zbekcha 🇺🇿", 'ob:uz').text('English 🇬🇧', 'ob:en')

function choiceKeyboard(values: readonly string[]): InlineKeyboard {
  const kb = new InlineKeyboard()
  values.forEach((v, i) => {
    const label = v === 'ielts' ? 'IELTS' : v === v.toLowerCase() ? v[0].toUpperCase() + v.slice(1) : v
    kb.text(label, `ob:${v}`)
    if (i % 2 === 1) kb.row()
  })
  return kb
}

@Injectable()
export class BotService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BotService.name)
  readonly bot: Bot<BotContext>

  constructor(
    @Inject(APP_CONFIG) private readonly config: Config,
    private readonly users: UsersService,
  ) {
    this.bot = new Bot<BotContext>(config.botToken)
    this.wire()
  }

  async notify(tgId: number, text: string): Promise<void> {
    try {
      await this.bot.api.sendMessage(tgId, text)
    } catch (err) {
      this.logger.warn(`notify failed for ${tgId}: ${String(err)}`)
    }
  }

  private wire(): void {
    this.bot.use(session({ initial: (): SessionData => ({ onboarding: initialState }) }))

    this.bot.command('start', async (ctx) => {
      if (!ctx.from) return
      await this.users.upsertFromTelegram({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
        username: ctx.from.username,
      })
      ctx.session.onboarding = initialState
      await ctx.reply(t('uz', 'welcome'), { reply_markup: langKeyboard })
    })

    this.bot.callbackQuery(/^ob:(.+)$/, async (ctx) => {
      const input = ctx.match[1]
      const result = applyInput(ctx.session.onboarding, input)
      const lang: UiLang = (result.ok ? result.state.uiLang : ctx.session.onboarding.uiLang) ?? 'uz'
      await ctx.answerCallbackQuery()

      if (!result.ok) {
        await ctx.reply(t(lang, 'invalid_choice'))
        return
      }

      ctx.session.onboarding = result.state
      switch (result.state.step) {
        case 'level':
          await ctx.reply(t(lang, 'ask_level'), { reply_markup: choiceKeyboard(LEVELS) })
          break
        case 'goal':
          await ctx.reply(t(lang, 'ask_goal'), { reply_markup: choiceKeyboard(GOALS) })
          break
        case 'availability':
          await ctx.reply(t(lang, 'ask_availability'), { reply_markup: choiceKeyboard(AVAILABILITIES) })
          break
        case 'done': {
          const s = result.state
          await this.users.completeOnboarding(ctx.callbackQuery.from.id, {
            ui_lang: s.uiLang!,
            level: s.level!,
            goal: s.goal!,
            availability: s.availability!,
          })
          await ctx.reply(
            t(lang, 'done'),
            this.config.webappUrl
              ? {
                  reply_markup: new InlineKeyboard().webApp(t(lang, 'open_app'), this.config.webappUrl),
                }
              : undefined,
          )
          break
        }
      }
    })

    this.bot.catch((err) => {
      this.logger.error(`bot error: ${String(err.error)}`)
    })
  }

  onApplicationBootstrap(): void {
    if (this.config.webappUrl) {
      void this.bot.api.setChatMenuButton({
        menu_button: { type: 'web_app', text: 'usfull', web_app: { url: this.config.webappUrl } },
      })
    }
    if (this.config.botMode === 'polling') {
      void this.bot.api.deleteWebhook().then(() => this.bot.start())
      this.logger.log('Bot started in polling mode')
    }
  }
}
