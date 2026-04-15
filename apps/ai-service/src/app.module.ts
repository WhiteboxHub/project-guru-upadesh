import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiController } from './controllers/ai.controller';
import { ClaudeService } from './services/claude/claude.service';
import { PromptBuilderService } from './services/claude/prompt-builder.service';
import { ResponseParserService } from './services/claude/response-parser.service';
import { CacheService } from './utils/cache.service';
import { TokenCounterService } from './utils/token-counter.service';
import { RateLimiterService } from './utils/rate-limiter.service';
import { CircuitBreakerService } from './utils/circuit-breaker.service';
import aiConfig from './config/ai.config';
import cacheConfig from './config/cache.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [aiConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
  ],
  controllers: [AiController],
  providers: [
    ClaudeService,
    PromptBuilderService,
    ResponseParserService,
    CacheService,
    TokenCounterService,
    RateLimiterService,
    CircuitBreakerService,
  ],
})
export class AppModule {}
