import { Inject, Injectable, Logger } from '@nestjs/common';
import { APP_VERSION } from '../app-version';
import { describeError } from '../common/describe-error';
import { DependencyCheck, HEALTH_CHECKS, HEALTH_CHECK_TIMEOUT_MS } from './dependency-check';

export interface HealthReport {
  status: 'ok' | 'degraded';
  version: string;
  time: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @Inject(HEALTH_CHECKS) private readonly checks: readonly DependencyCheck[],
    @Inject(HEALTH_CHECK_TIMEOUT_MS) private readonly timeoutMs: number,
  ) {}

  async check(): Promise<HealthReport> {
    const results = await Promise.allSettled(
      this.checks.map((dependency) => this.withTimeout(dependency)),
    );
    const failures = results.flatMap((result, index) =>
      result.status === 'rejected'
        ? [`${this.checks[index]?.name ?? 'unknown'} (${describeError(result.reason)})`]
        : [],
    );
    if (failures.length > 0) {
      this.logger.warn(`Unavailable dependencies: ${failures.join(', ')}`);
    }
    return {
      status: failures.length === 0 ? 'ok' : 'degraded',
      version: APP_VERSION,
      time: new Date().toISOString(),
    };
  }

  private async withTimeout(dependency: DependencyCheck): Promise<void> {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`${dependency.name} check timed out after ${String(this.timeoutMs)} ms`));
      }, this.timeoutMs);
    });
    try {
      await Promise.race([dependency.check(), timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
