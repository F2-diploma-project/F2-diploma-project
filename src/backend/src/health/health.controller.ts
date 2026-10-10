import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthReport, HealthService } from './health.service';

@Controller('v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<HealthReport> {
    const report = await this.healthService.check();
    if (report.status === 'degraded') {
      throw new HttpException(report, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return report;
  }
}
