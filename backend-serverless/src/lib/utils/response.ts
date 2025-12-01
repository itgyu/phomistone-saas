/**
 * API Response Utilities
 * Standardized response formatting
 */

import type { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse } from '../../types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Create a successful API response
 */
export const success = <T>(
  data: T,
  statusCode: number = 200,
  metadata?: Partial<ApiResponse['metadata']>
): APIGatewayProxyResult => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      ...metadata,
    },
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  };
};

/**
 * Create an error API response
 */
export const error = (
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): APIGatewayProxyResult => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    metadata: {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
    },
  };

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(response),
  };
};

/**
 * Create a created response (201)
 */
export const created = <T>(data: T): APIGatewayProxyResult => {
  return success(data, 201);
};

/**
 * Create a no content response (204)
 */
export const noContent = (): APIGatewayProxyResult => {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  };
};

/**
 * Create an accepted response (202) - for async operations
 */
export const accepted = <T>(data: T): APIGatewayProxyResult => {
  return success(data, 202);
};

/**
 * Parse request body safely
 */
export const parseBody = <T>(body: string | null): T => {
  if (!body) {
    return {} as T;
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw {
      statusCode: 400,
      code: 'INVALID_JSON',
      message: 'Request body must be valid JSON',
    };
  }
};

/**
 * Get path parameter with validation
 */
export const getPathParam = (
  pathParameters: Record<string, string | undefined> | null,
  name: string
): string => {
  const value = pathParameters?.[name];
  if (!value) {
    throw {
      statusCode: 400,
      code: 'MISSING_PARAMETER',
      message: `Path parameter '${name}' is required`,
    };
  }
  return value;
};

/**
 * Get query parameter with optional default
 */
export const getQueryParam = (
  queryStringParameters: Record<string, string | undefined> | null,
  name: string,
  defaultValue?: string
): string | undefined => {
  return queryStringParameters?.[name] ?? defaultValue;
};

/**
 * Get required query parameter
 */
export const getRequiredQueryParam = (
  queryStringParameters: Record<string, string | undefined> | null,
  name: string
): string => {
  const value = queryStringParameters?.[name];
  if (!value) {
    throw {
      statusCode: 400,
      code: 'MISSING_PARAMETER',
      message: `Query parameter '${name}' is required`,
    };
  }
  return value;
};
