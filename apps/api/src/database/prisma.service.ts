import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: LoggerService) {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'minimal',
    });

    this.setupLogging();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully', 'PrismaService');
    } catch (error) {
      this.logger.error('Failed to connect to database', error, 'PrismaService');
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database disconnected', 'PrismaService');
  }

  private setupLogging(): void {
    this.$on('query' as never, (e: any) => {
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`Query: ${e.query}`, 'PrismaService');
        this.logger.debug(`Duration: ${e.duration}ms`, 'PrismaService');
      }
    });

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Database error: ${e.message}`, e, 'PrismaService');
    });

    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Database warning: ${e.message}`, 'PrismaService');
    });
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => key !== '_transactionId' && !key.toString().startsWith('_'),
    );

    await Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as any).deleteMany();
        }
      }),
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
