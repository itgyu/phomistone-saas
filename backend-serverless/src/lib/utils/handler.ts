/**
 * Lambda Handler Wrapper
 * Centralized handler configuration with middy middleware
 * Supports both HTTP API (v2) and REST API (v1)
 */

import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpCors from '@middy/http-cors';
import type { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, Context } from 'aws-lambda';
import { formatErrorResponse } from './errors';
import type { AuthContext } from '../../types';

// Extended event type with parsed body and auth
export interface ExtendedAPIGatewayProxyEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  body: Record<string, unknown>;
  rawBody: string;
  auth?: AuthContext;
}

type Handler<T = ExtendedAPIGatewayProxyEvent> = (
  event: T,
  context: Context
) => Promise<APIGatewayProxyResult>;

/**
 * Middleware to normalize HTTP API v2 events to v1 format
 */
const httpApiNormalizer = (): middy.MiddlewareObj => ({
  before: async (request) => {
    const event = request.event as APIGatewayProxyEventV2 & APIGatewayProxyEvent;

    // If it's HTTP API v2 format, normalize to v1 format
    if (event.requestContext?.http) {
      const httpContext = event.requestContext.http;

      // Normalize path and method
      (event as any).path = event.rawPath || httpContext.path;
      (event as any).httpMethod = httpContext.method;

      // Normalize headers (HTTP API v2 headers are lowercase)
      if (event.headers) {
        const normalizedHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(event.headers)) {
          normalizedHeaders[key] = value || '';
          // Also add capitalized version for compatibility
          if (key === 'authorization') {
            normalizedHeaders['Authorization'] = value || '';
          }
        }
        (event as any).headers = normalizedHeaders;
      }
    }
  },
});

/**
 * Conditional JSON body parser - only parse if body exists
 */
const conditionalJsonParser = (): middy.MiddlewareObj => ({
  before: async (request) => {
    const event = request.event as any;
    const body = event.body;

    // Store raw body
    event.rawBody = body;

    // Only parse if body exists and is a string
    if (body && typeof body === 'string') {
      try {
        event.body = JSON.parse(body);
      } catch {
        // If parsing fails, keep original body
        event.body = {};
      }
    } else if (!body) {
      // No body (GET requests, etc.)
      event.body = {};
    }
  },
});

/**
 * Wrap a Lambda handler with standard middleware
 */
export const createHandler = <T = ExtendedAPIGatewayProxyEvent>(handler: Handler<T>) => {
  return middy(handler)
    .use(httpApiNormalizer())
    .use(conditionalJsonParser())
    .use(
      httpCors({
        origin: '*',
        credentials: true,
        headers: 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Request-Id',
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      })
    )
    .use({
      onError: async (request) => {
        const { error } = request;

        // Log the error
        console.error('Handler error:', {
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          } : error,
          event: {
            path: request.event.path,
            httpMethod: request.event.httpMethod,
            pathParameters: request.event.pathParameters,
            queryStringParameters: request.event.queryStringParameters,
          },
        });

        // Format the error response
        const response = formatErrorResponse(error);
        request.response = {
          ...response,
          headers: {
            ...request.response?.headers,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
          },
        };
      },
    });
};

/**
 * Create a simple handler without body parsing (for webhooks)
 */
export const createWebhookHandler = (handler: Handler<APIGatewayProxyEvent>) => {
  return middy(handler)
    .use(
      httpCors({
        origin: '*',
        methods: 'POST,OPTIONS',
      })
    )
    .use({
      onError: async (request) => {
        console.error('Webhook handler error:', request.error);
        const response = formatErrorResponse(request.error);
        request.response = {
          ...response,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        };
      },
    });
};

/**
 * Create an internal handler (no CORS, for internal Lambda invocations)
 */
export const createInternalHandler = <T>(handler: (event: T, context: Context) => Promise<unknown>) => {
  return async (event: T, context: Context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      console.error('Internal handler error:', error);
      throw error;
    }
  };
};
