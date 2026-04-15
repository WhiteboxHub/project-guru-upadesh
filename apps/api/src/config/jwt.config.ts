import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
