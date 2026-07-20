import { Global, Module } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { APP_CONFIG } from '../config/config.module'
import { Config } from '../config/configuration'
import { Database } from './types'

export const SUPABASE = 'SUPABASE'
export type Db = SupabaseClient<Database>

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE,
      inject: [APP_CONFIG],
      useFactory: (config: Config): Db =>
        createClient<Database>(config.supabaseUrl, config.supabaseServiceRoleKey),
    },
  ],
  exports: [SUPABASE],
})
export class DbModule {}
