/**
 * DynamoDB Client Singleton
 * Optimized for Lambda cold start performance
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'LOCAL',
      secretAccessKey: 'LOCAL',
    },
  }),
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export const TABLE_NAME = process.env.TABLE_NAME || 'PhomiEnterpriseTable';

// Index Names
export const GSI1_NAME = 'GSI1-ProjectName';
export const GSI2_NAME = 'GSI2-Share';
export const GSI3_NAME = 'GSI3-MaterialVersion';
export const GSI4_NAME = 'GSI4-ClientName';
