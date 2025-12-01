export * from './entities';

// Lambda Handler Types
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

// Auth Context from JWT
export interface AuthContext {
  userId: string;
  email: string;
  organizationId: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  cognitoSub: string;
}

// Extended Event with Auth
export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  auth: AuthContext;
}

// Environment Variables Type
export interface EnvConfig {
  TABLE_NAME: string;
  STAGE: string;
  REGION: string;
  S3_BUCKET: string;
  N8N_SEGMENT_WEBHOOK_URL: string;
  N8N_RENDER_WEBHOOK_URL: string;
  JWT_SECRET: string;
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
}
