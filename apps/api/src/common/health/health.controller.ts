import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';
import { Public } from '../decorators/public.decorator';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('healthz')
  @Public()
  @HealthCheck()
  check(): Promise<HealthIndicatorResult[]> {
    return this.health.check([]);
  }

  @Get('readyz')
  @Public()
  @HealthCheck()
  readiness(): Promise<HealthIndicatorResult[]> {
    return this.health.check([]);
  }
}
