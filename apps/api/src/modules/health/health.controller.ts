import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => {
        const isHealthy = await this.prisma.healthCheck();
        return {
          database: {
            status: isHealthy ? 'up' : 'down',
          },
        };
      },
    ]);
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
