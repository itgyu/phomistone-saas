/**
 * Error Handling Utilities
 * Standardized error creation and formatting
 */

export interface AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  isOperational: boolean;
}

/**
 * Create a standardized application error
 */
export const createError = (
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  error.isOperational = true;
  return error;
};

/**
 * Common error factories
 */
export const Errors = {
  notFound: (resource: string, id?: string) =>
    createError(404, 'NOT_FOUND', `${resource}${id ? ` with id '${id}'` : ''} not found`),

  badRequest: (message: string, details?: unknown) =>
    createError(400, 'BAD_REQUEST', message, details),

  unauthorized: (message: string = 'Authentication required') =>
    createError(401, 'UNAUTHORIZED', message),

  forbidden: (message: string = 'Access denied') =>
    createError(403, 'FORBIDDEN', message),

  conflict: (message: string) =>
    createError(409, 'CONFLICT', message),

  validationError: (errors: Record<string, string[]>) =>
    createError(422, 'VALIDATION_ERROR', 'Validation failed', errors),

  internalError: (message: string = 'An unexpected error occurred') =>
    createError(500, 'INTERNAL_ERROR', message),

  serviceUnavailable: (service: string) =>
    createError(503, 'SERVICE_UNAVAILABLE', `${service} is temporarily unavailable`),

  tooManyRequests: (retryAfter?: number) =>
    createError(429, 'TOO_MANY_REQUESTS', 'Rate limit exceeded', { retryAfter }),

  quotaExceeded: (resource: string) =>
    createError(402, 'QUOTA_EXCEEDED', `${resource} quota exceeded`),
};

/**
 * Check if error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    'code' in error &&
    'isOperational' in error
  );
};

/**
 * Format error for API response
 */
export const formatErrorResponse = (error: unknown): {
  statusCode: number;
  body: string;
} => {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }),
    };
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return {
    statusCode: 500,
    body: JSON.stringify({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }),
  };
};

/**
 * DynamoDB error handler
 */
export const handleDynamoDBError = (error: unknown): never => {
  const err = error as Error & { name?: string; code?: string };

  if (err.name === 'ConditionalCheckFailedException') {
    throw createError(409, 'CONFLICT', 'Resource already exists or condition not met');
  }

  if (err.name === 'ValidationException') {
    throw createError(400, 'VALIDATION_ERROR', err.message);
  }

  if (err.name === 'ProvisionedThroughputExceededException') {
    throw createError(429, 'TOO_MANY_REQUESTS', 'Database throughput exceeded');
  }

  if (err.name === 'ResourceNotFoundException') {
    throw createError(500, 'CONFIG_ERROR', 'DynamoDB table not found');
  }

  throw createError(500, 'DATABASE_ERROR', 'Database operation failed');
};
