#!/bin/bash

# Phomistone Backend Deployment Script
# Usage: ./scripts/deploy.sh [stage]

set -e

STAGE=${1:-dev}
REGION=${AWS_REGION:-ap-northeast-2}

echo "======================================"
echo "Phomistone Backend Deployment"
echo "Stage: $STAGE"
echo "Region: $REGION"
echo "======================================"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Deploy
echo ""
echo "Deploying to $STAGE..."
npx serverless deploy --stage $STAGE --region $REGION

# Get deployment outputs
echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"

echo ""
echo "Getting deployment info..."
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name phomistone-backend-$STAGE \
    --query "Stacks[0].Outputs[?OutputKey=='ApiEndpoint'].OutputValue" \
    --output text \
    --region $REGION 2>/dev/null || echo "N/A")

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name phomistone-backend-$STAGE \
    --query "Stacks[0].Outputs[?OutputKey=='TableName'].OutputValue" \
    --output text \
    --region $REGION 2>/dev/null || echo "N/A")

USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name phomistone-backend-$STAGE \
    --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" \
    --output text \
    --region $REGION 2>/dev/null || echo "N/A")

echo ""
echo "Resources:"
echo "  API Endpoint:  $API_ENDPOINT"
echo "  DynamoDB:      $TABLE_NAME"
echo "  User Pool:     $USER_POOL_ID"
echo ""

# Seed materials prompt
echo "======================================"
echo "Post-Deployment Steps"
echo "======================================"
echo ""
echo "1. Set up SSM parameters for secrets:"
echo "   aws ssm put-parameter --name '/phomistone/$STAGE/jwt-secret' --value 'YOUR_JWT_SECRET' --type SecureString"
echo "   aws ssm put-parameter --name '/phomistone/$STAGE/n8n-segment-webhook-url' --value 'YOUR_N8N_SEGMENT_URL' --type String"
echo "   aws ssm put-parameter --name '/phomistone/$STAGE/n8n-render-webhook-url' --value 'YOUR_N8N_RENDER_URL' --type String"
echo ""
echo "2. Seed materials (run once after first deployment):"
echo "   npm run invoke:seed"
echo "   OR: npx serverless invoke -f seedMaterials --stage $STAGE"
echo ""
echo "3. Update frontend environment with API endpoint:"
echo "   VITE_API_URL=$API_ENDPOINT"
echo ""
