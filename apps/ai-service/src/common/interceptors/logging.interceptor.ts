import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;

          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request Failed: ${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
