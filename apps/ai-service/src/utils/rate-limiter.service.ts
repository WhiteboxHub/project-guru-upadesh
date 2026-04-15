import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly RATE_LIMIT_PREFIX = 'rate-limit:';

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Check if request is allowed under rate limit
   */
  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;

    try {
      const info = await this.cacheService.get<RateLimitInfo>(key);
      const now = Date.now();

      if (!info || now >= info.resetTime) {
        // No existing limit or window expired, create new window
        const resetTime = now + windowSeconds * 1000;
        await this.cacheService.set(
          key,
          {
            count: 1,
            resetTime,
          },
          windowSeconds,
        );

        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime,
        };
      }

      // Within existing window
      if (info.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: info.resetTime,
        };
      }

      // Increment counter
      info.count += 1;
      const ttl = Math.ceil((info.resetTime - now) / 1000);
      await this.cacheService.set(key, info, ttl);

      return {
        allowed: true,
        remaining: maxRequests - info.count,
        resetTime: info.resetTime,
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed for ${identifier}`, error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + windowSeconds * 1000,
      };
    }
  }

  /**
   * Check AI-specific rate limits (lower limits for expensive operations)
   */
  async checkAiLimit(
    identifier: string,
    operation: string,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const limits = this.getAiLimits(operation);
    return this.checkLimit(`ai:${operation}:${identifier}`, limits.max, limits.window);
  }

  /**
   * Get rate limits for different AI operations
   */
  private getAiLimits(operation: string): { max: number; window: number } {
    const limits: Record<string, { max: number; window: number }> = {
      generate_question: { max: 50, window: 3600 }, // 50 per hour
      evaluate_answer: { max: 100, window: 3600 }, // 100 per hour
      analyze_resume: { max: 20, window: 3600 }, // 20 per hour (expensive)
      generate_feedback: { max: 30, window: 3600 }, // 30 per hour
      default: { max: 50, window: 3600 },
    };

    return limits[operation] || limits.default;
  }

  /**
   * Reset rate limit for identifier
   */
  async resetLimit(identifier: string): Promise<void> {
    const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;
    await this.cacheService.delete(key);
    this.logger.debug(`Rate limit reset for ${identifier}`);
  }

  /**
   * Get current rate limit status
   */
  async getLimitStatus(identifier: string): Promise<RateLimitInfo | null> {
    const key = `${this.RATE_LIMIT_PREFIX}${identifier}`;
    return this.cacheService.get<RateLimitInfo>(key);
  }

  /**
   * Implement sliding window rate limiting (more accurate)
   */
  async checkSlidingWindow(
    identifier: string,
    maxRequests: number,
    windowSeconds: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
  }> {
    const key = `${this.RATE_LIMIT_PREFIX}sliding:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    try {
      // Get all timestamps in the window
      const timestamps = (await this.cacheService.get<number[]>(key)) || [];

      // Remove timestamps outside the window
      const validTimestamps = timestamps.filter((ts) => ts > windowStart);

      if (validTimestamps.length >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
        };
      }

      // Add current timestamp
      validTimestamps.push(now);
      await this.cacheService.set(key, validTimestamps, windowSeconds);

      return {
        allowed: true,
        remaining: maxRequests - validTimestamps.length,
      };
    } catch (error) {
      this.logger.error(`Sliding window rate limit check failed for ${identifier}`, error);
      // Fail open
      return {
        allowed: true,
        remaining: maxRequests,
      };
    }
  }

  /**
   * Check if user is temporarily blocked due to rate limiting
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const blockKey = `${this.RATE_LIMIT_PREFIX}block:${identifier}`;
    return this.cacheService.exists(blockKey);
  }

  /**
   * Temporarily block a user for excessive requests
   */
  async blockUser(identifier: string, durationSeconds: number = 3600): Promise<void> {
    const blockKey = `${this.RATE_LIMIT_PREFIX}block:${identifier}`;
    await this.cacheService.set(blockKey, { blocked: true, timestamp: Date.now() }, durationSeconds);
    this.logger.warn(`User ${identifier} temporarily blocked for ${durationSeconds}s`);
  }

  /**
   * Unblock a user
   */
  async unblockUser(identifier: string): Promise<void> {
    const blockKey = `${this.RATE_LIMIT_PREFIX}block:${identifier}`;
    await this.cacheService.delete(blockKey);
    this.logger.log(`User ${identifier} unblocked`);
  }
}
