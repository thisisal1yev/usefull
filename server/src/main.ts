import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { webhookCallback } from 'grammy'
import { AppModule } from './app.module'
import { APP_CONFIG } from './config/config.module'
import { Config } from './config/configuration'
import { BotService } from './bot/bot.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get<Config>(APP_CONFIG)

  app.enableCors({ origin: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  if (config.botMode === 'webhook') {
    const botService = app.get(BotService)
    app.use('/webhook', webhookCallback(botService.bot, 'express', { secretToken: config.webhookSecret }))
  }

  await app.listen(config.port)
  console.log(`usfull server listening on :${config.port} (bot mode: ${config.botMode})`)
}

void bootstrap()
