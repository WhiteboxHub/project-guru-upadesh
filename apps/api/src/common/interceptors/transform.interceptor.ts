import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object') {
          const { data: responseData, meta, message, ...rest } = data as any;

          if (responseData !== undefined) {
            return {
              success: true,
              data: responseData,
              ...(message && { message }),
              ...(meta && { meta }),
            };
          }

          if ('success' in rest) {
            return data;
          }

          return {
            success: true,
            data,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
