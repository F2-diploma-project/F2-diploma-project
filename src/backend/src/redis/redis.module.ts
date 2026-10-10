import { Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { describeError } from '../common/describe-error';
import { Env } from '../config/env';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const CONNECTION_TIMEOUT_MS = 1000;

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Redis => {
        const logger = new Logger('Redis');
        const client = new Redis(config.get('REDIS_URL', { infer: true }), {
          connectTimeout: CONNECTION_TIMEOUT_MS,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1,
        });
        client.on('error', (error) => {
          logger.error(`Connection error: ${describeError(error)}`);
        });
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  onApplicationShutdown(): void {
    this.client.disconnect();
  }
}
