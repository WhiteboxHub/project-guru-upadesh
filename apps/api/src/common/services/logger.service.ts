import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, trace }) => {
            const contextStr = context ? `[${context}] ` : '';
            const traceStr = trace ? `\n${trace}` : '';
            return `${timestamp} ${level}: ${contextStr}${message}${traceStr}`;
          }),
        ),
      }),
    ];

    if (process.env.NODE_ENV !== 'test') {
      transports.push(
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new DailyRotateFile({
          dirname: 'logs',
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'guru-upadesh-api',
        environment: process.env.NODE_ENV || 'development',
      },
      transports,
      exitOnError: false,
    });
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string | Error, context?: string): void {
    if (trace instanceof Error) {
      this.logger.error(message, {
        context,
        trace: trace.stack,
        error: {
          name: trace.name,
          message: trace.message,
        },
      });
    } else {
      this.logger.error(message, { context, trace });
    }
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
