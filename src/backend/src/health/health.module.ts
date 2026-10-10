import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { DatabaseModule, PG_POOL } from '../database/database.module';
import { REDIS_CLIENT, RedisModule } from '../redis/redis.module';
import { DependencyCheck, HEALTH_CHECKS, HEALTH_CHECK_TIMEOUT_MS } from './dependency-check';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

const CHECK_TIMEOUT_MS = 1000;

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    { provide: HEALTH_CHECK_TIMEOUT_MS, useValue: CHECK_TIMEOUT_MS },
    {
      provide: HEALTH_CHECKS,
      inject: [PG_POOL, REDIS_CLIENT],
      useFactory: (pool: Pool, redis: Redis): DependencyCheck[] => [
        {
          name: 'postgres',
          check: async () => {
            await pool.query('SELECT 1');
          },
        },
        {
          name: 'redis',
          check: async () => {
            await redis.ping();
          },
        },
      ],
    },
  ],
})
export class HealthModule {}
