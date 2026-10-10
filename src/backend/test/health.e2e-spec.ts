import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { APP_VERSION } from '../src/app-version';
import { DependencyCheck, HEALTH_CHECKS, HEALTH_CHECK_TIMEOUT_MS } from '../src/health/dependency-check';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';

type Behavior = 'up' | 'down' | 'hang';

function expectHealthBody(body: unknown, status: 'ok' | 'degraded'): void {
  expect(Object.keys(body as object).sort()).toEqual(['status', 'time', 'version']);
  const { time, ...rest } = body as { status: string; version: string; time: string };
  expect(rest).toEqual({ status, version: APP_VERSION });
  expect(new Date(time).toISOString()).toBe(time);
}

function fakeCheck(name: string, behavior: Behavior): DependencyCheck {
  return {
    name,
    check: () => {
      if (behavior === 'up') return Promise.resolve();
      if (behavior === 'down') return Promise.reject(new Error(`${name} is down`));
      return new Promise<void>(() => undefined);
    },
  };
}

describe('GET /v1/health', () => {
  let app: INestApplication<App> | undefined;

  async function startApp(postgres: Behavior, redis: Behavior): Promise<INestApplication<App>> {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: HEALTH_CHECKS,
          useValue: [fakeCheck('postgres', postgres), fakeCheck('redis', redis)],
        },
        { provide: HEALTH_CHECK_TIMEOUT_MS, useValue: 50 },
      ],
    }).compile();
    const created = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });
    await created.init();
    app = created;
    return created;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('returns 200 ok with only contract fields when Postgres and Redis are available', async () => {
    const server = (await startApp('up', 'up')).getHttpServer();

    const response = await request(server).get('/v1/health').expect(200);

    expectHealthBody(response.body, 'ok');
  });

  it('returns 503 degraded when Postgres is unavailable', async () => {
    const server = (await startApp('down', 'up')).getHttpServer();

    const response = await request(server).get('/v1/health').expect(503);

    expectHealthBody(response.body, 'degraded');
  });

  it('returns 503 degraded when Redis is unavailable', async () => {
    const server = (await startApp('up', 'down')).getHttpServer();

    const response = await request(server).get('/v1/health').expect(503);

    expectHealthBody(response.body, 'degraded');
  });

  it('returns 503 degraded when a check does not answer within the timeout', async () => {
    const server = (await startApp('up', 'hang')).getHttpServer();

    const response = await request(server).get('/v1/health').expect(503);

    expectHealthBody(response.body, 'degraded');
  });
});
