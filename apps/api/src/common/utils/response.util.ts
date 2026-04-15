export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message: string;
    details?: any[];
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseUtil {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      ...(message && { message }),
    };
  }

  static successWithMeta<T>(
    data: T,
    meta: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        ...meta,
        totalPages: Math.ceil(meta.total / meta.limit),
      },
      ...(message && { message }),
    };
  }

  static error(
    message: string,
    code?: string,
    details?: any[],
  ): ApiResponse<never> {
    return {
      success: false,
      error: {
        message,
        ...(code && { code }),
        ...(details && { details }),
      },
    };
  }

  static paginate<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): ApiResponse<T[]> {
    return {
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
