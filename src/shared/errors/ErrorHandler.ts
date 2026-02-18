import { AppError } from './AppError';

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
}

export class ErrorHandler {
  static handle(error: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        timestamp,
      };
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        details: error,
        timestamp,
      };
    }

    // Log unexpected errors
    console.error('Unexpected error:', error);

    return {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
      timestamp,
    };
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}
