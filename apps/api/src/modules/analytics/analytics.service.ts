import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async getUserAnalytics(userId: string, period?: string) {
    const where: any = { userId };
    if (period) {
      where.period = period;
    }

    return this.prisma.userAnalytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
  }

  async getOverallStats(userId: string) {
    const [totalInterviews, completedInterviews, avgScore, recentInterviews] =
      await Promise.all([
        this.prisma.interview.count({
          where: { userId },
        }),
        this.prisma.interview.count({
          where: {
            userId,
            status: 'COMPLETED',
          },
        }),
        this.prisma.interview.aggregate({
          where: {
            userId,
            status: 'COMPLETED',
            score: { not: null },
          },
          _avg: {
            score: true,
          },
        }),
        this.prisma.interview.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            score: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      totalInterviews,
      completedInterviews,
      averageScore: avgScore._avg.score || 0,
      recentInterviews,
    };
  }
}
