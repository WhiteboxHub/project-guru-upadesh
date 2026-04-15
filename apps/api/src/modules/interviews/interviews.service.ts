import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        difficulty: true,
        status: true,
        score: true,
        startedAt: true,
        completedAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true,
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
      },
    });
  }
}
