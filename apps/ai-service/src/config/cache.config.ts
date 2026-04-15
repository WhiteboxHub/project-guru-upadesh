import { registerAs } from '@nestjs/config';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  ttl: number;
  enabled: boolean;
}

export default registerAs(
  'cache',
  (): CacheConfig => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    enabled: process.env.CACHE_ENABLED !== 'false',
  }),
);
