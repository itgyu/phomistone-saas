import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'phomistone-backend',
  frameworkVersion: '3',

  plugins: [
    'serverless-esbuild',
    'serverless-offline',
  ],

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'ap-northeast-2',
    stage: '${opt:stage, "dev"}',
    memorySize: 512,
    timeout: 30,

    environment: {
      // Core Settings
      TABLE_NAME: '${self:custom.tableName}',
      STAGE: '${self:provider.stage}',
      REGION: '${self:provider.region}',

      // S3
      S3_BUCKET: '${self:custom.s3Bucket}',
      ASSETS_BASE_URL: 'https://${self:custom.s3Bucket}.s3.${self:provider.region}.amazonaws.com/materials',

      // Gemini API Key
      GEMINI_API_KEY: '${ssm:/phomistone/${self:provider.stage}/gemini-api-key, ""}',

      // Auth
      JWT_SECRET: '${ssm:/phomistone/${self:provider.stage}/jwt-secret, "phomistone-dev-secret-change-in-prod"}',
      WEBHOOK_SECRET: '${ssm:/phomistone/${self:provider.stage}/webhook-secret, "phomistone-webhook-secret"}',
      COGNITO_USER_POOL_ID: { Ref: 'CognitoUserPool' },
      COGNITO_CLIENT_ID: { Ref: 'CognitoUserPoolClient' },

      // API Gateway URL (populated after deployment)
      API_GATEWAY_URL: {
        'Fn::Sub': 'https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com',
      },

      // Node.js settings
      NODE_OPTIONS: '--enable-source-maps',
    },

    iam: {
      role: {
        statements: [
          // DynamoDB permissions
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:BatchGetItem',
            ],
            Resource: [
              { 'Fn::GetAtt': ['PhomiEnterpriseTable', 'Arn'] },
              { 'Fn::Sub': '${PhomiEnterpriseTable.Arn}/index/*' },
            ],
          },
          // S3 permissions
          {
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
            ],
            Resource: [
              'arn:aws:s3:::${self:custom.s3Bucket}/*',
            ],
          },
          // SSM Parameter Store (for secrets)
          {
            Effect: 'Allow',
            Action: ['ssm:GetParameter', 'ssm:GetParameters'],
            Resource: [
              'arn:aws:ssm:${self:provider.region}:*:parameter/phomistone/${self:provider.stage}/*',
            ],
          },
        ],
      },
    },

    httpApi: {
      cors: {
        allowedOrigins: ['*'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Request-Id'],
        allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      },
    },
  },

  custom: {
    tableName: 'PhomiEnterpriseTable-${self:provider.stage}',
    s3Bucket: 'phomistone-assets-${self:provider.stage}',

    esbuild: {
      bundle: true,
      minify: true,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
      external: ['pdfkit'],
    },

    'serverless-offline': {
      httpPort: 3001,
      lambdaPort: 3002,
    },
  },

  functions: {
    // ============================================
    // AI Pipeline Functions
    // ============================================
    startSegmentation: {
      handler: 'src/functions/ai-pipeline/startSegmentation.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}/images/{imageId}/segment',
            method: 'post',
          },
        },
      ],
      timeout: 30,
    },

    startRendering: {
      handler: 'src/functions/ai-pipeline/startRendering.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}/images/{imageId}/versions/{versionId}/render',
            method: 'post',
          },
        },
      ],
      timeout: 30,
    },

    webhookSegmentation: {
      handler: 'src/functions/ai-pipeline/webhookHandler.main',
      events: [
        {
          httpApi: {
            path: '/webhook/segmentation',
            method: 'post',
          },
        },
      ],
      timeout: 30,
    },

    webhookRender: {
      handler: 'src/functions/ai-pipeline/webhookHandler.main',
      events: [
        {
          httpApi: {
            path: '/webhook/render',
            method: 'post',
          },
        },
      ],
      timeout: 30,
    },

    // Style Building (replaces n8n workflow)
    // Uses Lambda Function URL for long-running AI tasks (no API Gateway timeout)
    styleBuilding: {
      handler: 'src/functions/ai-pipeline/styleBuildingHandler.main',
      timeout: 300, // 5 minutes for AI image generation
      memorySize: 1024,
      url: true,
    },

    // ============================================
    // Project Functions
    // ============================================
    createProject: {
      handler: 'src/functions/projects/createProject.main',
      events: [
        {
          httpApi: {
            path: '/projects',
            method: 'post',
          },
        },
      ],
    },

    listProjects: {
      handler: 'src/functions/projects/listProjects.main',
      events: [
        {
          httpApi: {
            path: '/projects',
            method: 'get',
          },
        },
      ],
    },

    getProject: {
      handler: 'src/functions/projects/getProject.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}',
            method: 'get',
          },
        },
      ],
    },

    updateProject: {
      handler: 'src/functions/projects/updateProject.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}',
            method: 'put',
          },
        },
      ],
    },

    deleteProject: {
      handler: 'src/functions/projects/deleteProject.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}',
            method: 'delete',
          },
        },
      ],
    },

    searchProjects: {
      handler: 'src/functions/projects/searchProjects.main',
      events: [
        {
          httpApi: {
            path: '/projects/search',
            method: 'get',
          },
        },
      ],
    },

    createVersion: {
      handler: 'src/functions/projects/createVersion.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}/images/{imageId}/versions',
            method: 'post',
          },
        },
      ],
    },

    // ============================================
    // Material Functions
    // ============================================
    seedMaterials: {
      handler: 'src/functions/materials/seedMaterials.main',
      timeout: 60,
      memorySize: 1024,
      // No HTTP event - invoke via CLI: serverless invoke -f seedMaterials
    },

    // ============================================
    // Admin Functions
    // ============================================
    adminUpdateRole: {
      handler: 'src/functions/admin/adminUpdateRole.main',
      events: [
        {
          httpApi: {
            path: '/admin/users/{email}/role',
            method: 'put',
          },
        },
      ],
    },

    // ============================================
    // Export Functions
    // ============================================
    generatePDF: {
      handler: 'src/functions/export/generatePDF.main',
      events: [
        {
          httpApi: {
            path: '/projects/{projectId}/export/pdf',
            method: 'get',
          },
        },
      ],
      timeout: 60,
      memorySize: 1024,
    },
  },

  resources: {
    Resources: {
      // ============================================
      // DynamoDB - Single Table Design
      // ============================================
      PhomiEnterpriseTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:custom.tableName}',
          BillingMode: 'PAY_PER_REQUEST',

          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' },
            { AttributeName: 'GSI2PK', AttributeType: 'S' },
            { AttributeName: 'GSI2SK', AttributeType: 'S' },
            { AttributeName: 'GSI3PK', AttributeType: 'S' },
            { AttributeName: 'GSI3SK', AttributeType: 'S' },
            { AttributeName: 'GSI4PK', AttributeType: 'S' },
            { AttributeName: 'GSI4SK', AttributeType: 'S' },
          ],

          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' },
          ],

          GlobalSecondaryIndexes: [
            // GSI1: Project name search
            {
              IndexName: 'GSI1-ProjectName',
              KeySchema: [
                { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
            // GSI2: Share links
            {
              IndexName: 'GSI2-Share',
              KeySchema: [
                { AttributeName: 'GSI2PK', KeyType: 'HASH' },
                { AttributeName: 'GSI2SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
            // GSI3: Material version lookup
            {
              IndexName: 'GSI3-MaterialVersion',
              KeySchema: [
                { AttributeName: 'GSI3PK', KeyType: 'HASH' },
                { AttributeName: 'GSI3SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
            // GSI4: Client name search (★ 추가됨)
            {
              IndexName: 'GSI4-ClientName',
              KeySchema: [
                { AttributeName: 'GSI4PK', KeyType: 'HASH' },
                { AttributeName: 'GSI4SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],

          // TTL for RenderJob cleanup
          TimeToLiveSpecification: {
            AttributeName: 'expiresAt',
            Enabled: true,
          },

          // Point-in-time recovery
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true,
          },

          Tags: [
            { Key: 'Service', Value: 'phomistone' },
            { Key: 'Environment', Value: '${self:provider.stage}' },
          ],
        },
      },

      // ============================================
      // S3 Bucket
      // ============================================
      AssetsBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:custom.s3Bucket}',
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
                AllowedOrigins: ['*'],
                MaxAge: 3600,
              },
            ],
          },
          PublicAccessBlockConfiguration: {
            BlockPublicAcls: true,
            BlockPublicPolicy: true,
            IgnorePublicAcls: true,
            RestrictPublicBuckets: true,
          },
          Tags: [
            { Key: 'Service', Value: 'phomistone' },
            { Key: 'Environment', Value: '${self:provider.stage}' },
          ],
        },
      },

      // ============================================
      // Cognito User Pool
      // ============================================
      CognitoUserPool: {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: 'phomistone-users-${self:provider.stage}',
          AutoVerifiedAttributes: ['email'],
          UsernameAttributes: ['email'],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireUppercase: true,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: false,
            },
          },
          Schema: [
            {
              Name: 'email',
              Required: true,
              Mutable: false,
            },
            {
              Name: 'name',
              Required: true,
              Mutable: true,
            },
          ],
        },
      },

      CognitoUserPoolClient: {
        Type: 'AWS::Cognito::UserPoolClient',
        Properties: {
          ClientName: 'phomistone-web-${self:provider.stage}',
          UserPoolId: { Ref: 'CognitoUserPool' },
          ExplicitAuthFlows: [
            'ALLOW_USER_PASSWORD_AUTH',
            'ALLOW_REFRESH_TOKEN_AUTH',
            'ALLOW_USER_SRP_AUTH',
          ],
          GenerateSecret: false,
          PreventUserExistenceErrors: 'ENABLED',
          AccessTokenValidity: 1, // 1 hour
          IdTokenValidity: 1,
          RefreshTokenValidity: 30, // 30 days
          TokenValidityUnits: {
            AccessToken: 'hours',
            IdToken: 'hours',
            RefreshToken: 'days',
          },
        },
      },
    },

    Outputs: {
      TableName: {
        Description: 'DynamoDB Table Name',
        Value: { Ref: 'PhomiEnterpriseTable' },
        Export: { Name: '${self:service}-${self:provider.stage}-TableName' },
      },
      TableArn: {
        Description: 'DynamoDB Table ARN',
        Value: { 'Fn::GetAtt': ['PhomiEnterpriseTable', 'Arn'] },
        Export: { Name: '${self:service}-${self:provider.stage}-TableArn' },
      },
      BucketName: {
        Description: 'S3 Bucket Name',
        Value: { Ref: 'AssetsBucket' },
        Export: { Name: '${self:service}-${self:provider.stage}-BucketName' },
      },
      UserPoolId: {
        Description: 'Cognito User Pool ID',
        Value: { Ref: 'CognitoUserPool' },
        Export: { Name: '${self:service}-${self:provider.stage}-UserPoolId' },
      },
      UserPoolClientId: {
        Description: 'Cognito User Pool Client ID',
        Value: { Ref: 'CognitoUserPoolClient' },
        Export: { Name: '${self:service}-${self:provider.stage}-UserPoolClientId' },
      },
      ApiEndpoint: {
        Description: 'API Gateway Endpoint',
        Value: {
          'Fn::Sub': 'https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com',
        },
        Export: { Name: '${self:service}-${self:provider.stage}-ApiEndpoint' },
      },
    },
  },
};

module.exports = serverlessConfiguration;
