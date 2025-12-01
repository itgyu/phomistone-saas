/**
 * Authentication Middleware
 * Cognito JWT verification
 */

import type { MiddlewareObj } from '@middy/core';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createError } from '../utils/errors';
import type { AuthContext } from '../../types';

interface AuthenticatedRequest extends APIGatewayProxyEvent {
  auth: AuthContext;
}

interface AuthMiddlewareOptions {
  requiredRoles?: Array<'Owner' | 'Editor' | 'Viewer'>;
}

// Cognito JWKS client (cached)
let jwksClientInstance: jwksClient.JwksClient | null = null;

function getJwksClient(): jwksClient.JwksClient {
  if (!jwksClientInstance) {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const region = process.env.REGION || 'ap-northeast-2';

    if (!userPoolId) {
      throw createError(500, 'CONFIG_ERROR', 'COGNITO_USER_POOL_ID not configured');
    }

    jwksClientInstance = jwksClient({
      jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
    });
  }
  return jwksClientInstance;
}

/**
 * Get signing key from Cognito JWKS
 */
async function getSigningKey(kid: string): Promise<string> {
  const client = getJwksClient();
  const key = await client.getSigningKey(kid);
  return key.getPublicKey();
}

/**
 * Decode and verify Cognito JWT token
 */
async function verifyCognitoToken(token: string): Promise<jwt.JwtPayload> {
  // First decode without verification to get the kid
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || !decoded.header.kid) {
    throw createError(401, 'INVALID_TOKEN', 'Invalid token format');
  }

  // Get the signing key
  const signingKey = await getSigningKey(decoded.header.kid);

  // Verify the token
  const verified = jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
  }) as jwt.JwtPayload;

  return verified;
}

/**
 * Middleware to verify JWT token and extract user context
 */
export const authMiddleware = (options: AuthMiddlewareOptions = {}): MiddlewareObj<AuthenticatedRequest> => {
  const before: MiddlewareObj<AuthenticatedRequest>['before'] = async (request) => {
    const { headers } = request.event;
    const authHeader = headers?.Authorization || headers?.authorization;

    if (!authHeader) {
      throw createError(401, 'UNAUTHORIZED', 'Authorization header is required');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      throw createError(401, 'UNAUTHORIZED', 'Bearer token is required');
    }

    try {
      // Verify Cognito token
      const decoded = await verifyCognitoToken(token);

      // Extract user info from Cognito token
      const userId = decoded.sub || '';
      const email = decoded.email || decoded['cognito:username'] || '';

      // For now, use a default organization until we implement organization lookup
      // In production, you would look up the user's organization from DynamoDB
      const organizationId = `ORG#${userId}`;

      const authContext: AuthContext = {
        userId,
        email,
        organizationId,
        role: 'Owner', // Default role, should be looked up from DB
      };

      // Validate required roles
      if (options.requiredRoles && options.requiredRoles.length > 0) {
        if (!options.requiredRoles.includes(authContext.role)) {
          throw createError(
            403,
            'FORBIDDEN',
            `Requires one of the following roles: ${options.requiredRoles.join(', ')}`
          );
        }
      }

      // Attach auth context to request
      request.event.auth = authContext;
    } catch (error) {
      if ((error as any).statusCode) {
        throw error; // Re-throw our custom errors
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw createError(401, 'INVALID_TOKEN', 'Invalid or expired token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw createError(401, 'TOKEN_EXPIRED', 'Token has expired');
      }
      console.error('Auth error:', error);
      throw createError(401, 'UNAUTHORIZED', 'Authentication failed');
    }
  };

  return { before };
};

/**
 * Middleware for Owner-only routes
 */
export const ownerOnly = (): MiddlewareObj<AuthenticatedRequest> => {
  return authMiddleware({ requiredRoles: ['Owner'] });
};

/**
 * Middleware for Editor and above
 */
export const editorOrAbove = (): MiddlewareObj<AuthenticatedRequest> => {
  return authMiddleware({ requiredRoles: ['Owner', 'Editor'] });
};
