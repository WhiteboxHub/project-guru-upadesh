import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private enabled: boolean;
  private defaultTtl: number;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('cache.enabled', true);
    this.defaultTtl = this.configService.get<number>('cache.ttl', 3600);
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.warn('Cache is disabled');
      return;
    }

    try {
      const host = this.configService.get<string>('cache.host', 'localhost');
      const port = this.configService.get<number>('cache.port', 6379);
      const password = this.configService.get<string>('cache.password');
      const db = this.configService.get<number>('cache.db', 0);

      this.redis = new Redis({
        host,
        port,
        password,
        db,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error', error);
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis connection closed');
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis', error);
      this.enabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      const ttl = ttlSeconds || this.defaultTtl;

      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      this.logger.error(`Failed to set cache key: ${key}`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete cache pattern: ${pattern}`, error);
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.enabled || !this.redis) {
      return false;
    }

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key existence: ${key}`, error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async getTtl(key: string): Promise<number> {
    if (!this.enabled || !this.redis) {
      return -1;
    }

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for cache key: ${key}`, error);
      return -1;
    }
  }

  /**
   * Increment a counter in cache
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.enabled || !this.redis) {
      return 0;
    }

    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Failed to increment cache key: ${key}`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    enabled: boolean;
    connected: boolean;
    keyCount: number;
  }> {
    if (!this.enabled || !this.redis) {
      return { enabled: false, connected: false, keyCount: 0 };
    }

    try {
      const info = await this.redis.info('stats');
      const keyspaceInfo = await this.redis.info('keyspace');

      // Parse keyspace info to get key count
      const dbMatch = keyspaceInfo.match(/db\d+:keys=(\d+)/);
      const keyCount = dbMatch ? parseInt(dbMatch[1], 10) : 0;

      return {
        enabled: true,
        connected: this.redis.status === 'ready',
        keyCount,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', error);
      return { enabled: true, connected: false, keyCount: 0 };
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clear(): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      await this.redis.flushdb();
      this.logger.warn('Cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache', error);
    }
  }

  /**
   * Gracefully close Redis connection
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
