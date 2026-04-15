import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = this.buildErrorResponse(status, message, request);

    this.logError(exception, request, status);

    response.status(status).json(errorResponse);
  }

  private buildErrorResponse(
    status: number,
    message: string | object,
    request: Request,
  ): object {
    const baseResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    if (typeof message === 'string') {
      return {
        ...baseResponse,
        error: {
          message,
        },
      };
    }

    if (typeof message === 'object' && message !== null) {
      const msgObj = message as any;
      return {
        ...baseResponse,
        error: {
          message: msgObj.message || 'An error occurred',
          ...(msgObj.error && { code: msgObj.error }),
          ...(Array.isArray(msgObj.message) && { details: msgObj.message }),
        },
      };
    }

    return {
      ...baseResponse,
      error: {
        message: 'An error occurred',
      },
    };
  }

  private logError(
    exception: unknown,
    request: Request,
    status: number,
  ): void {
    const errorMessage = exception instanceof Error ? exception.message : String(exception);
    const errorStack = exception instanceof Error ? exception.stack : undefined;

    const logMessage = `${request.method} ${request.url} ${status} - ${errorMessage}`;

    if (status >= 500) {
      this.logger.error(logMessage, errorStack, 'HttpExceptionFilter');
    } else if (status >= 400) {
      this.logger.warn(logMessage, 'HttpExceptionFilter');
    }
  }
}
