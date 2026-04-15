import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@Controller({ path: 'analytics', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get user analytics' })
  @ApiQuery({
    name: 'period',
    required: false,
    type: String,
    example: '2024-01',
  })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  getUserAnalytics(
    @CurrentUser('userId') userId: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getUserAnalytics(userId, period);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get overall user statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  getStats(@CurrentUser('userId') userId: string) {
    return this.analyticsService.getOverallStats(userId);
  }
}
