import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        skip,
        take: limit,
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          text: true,
          category: true,
          difficulty: true,
          tags: true,
          company: true,
          createdAt: true,
        },
      }),
      this.prisma.question.count({
        where: { isActive: true },
      }),
    ]);

    return {
      data: questions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        category: true,
        difficulty: true,
        tags: true,
        company: true,
        hints: true,
        createdAt: true,
      },
    });
  }
}
