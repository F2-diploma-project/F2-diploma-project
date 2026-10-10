import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { describeError } from '../common/describe-error';
import { Env } from '../config/env';

export const PG_POOL = Symbol('PG_POOL');

const CONNECTION_TIMEOUT_MS = 1000;

@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Pool => {
        const logger = new Logger('Postgres');
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL', { infer: true }),
          connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
        });
        pool.on('error', (error) => {
          logger.error(`Idle client error: ${describeError(error)}`);
        });
        return pool;
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
