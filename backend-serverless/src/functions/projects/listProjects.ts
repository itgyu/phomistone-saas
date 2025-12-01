/**
 * List Projects Lambda
 * Returns paginated list of projects for the organization
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getQueryParam } from '../../lib/utils/response';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo } from '../../lib/db/repository';

interface AuthenticatedEvent extends ExtendedAPIGatewayProxyEvent {
  auth: {
    userId: string;
    organizationId: string;
    role: 'Owner' | 'Editor' | 'Viewer';
  };
}

const handler = async (
  event: AuthenticatedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { organizationId } = event.auth;

  const limitParam = getQueryParam(event.queryStringParameters, 'limit', '20');
  const limit = Math.min(parseInt(limitParam || '20', 10), 100);
  const nextToken = getQueryParam(event.queryStringParameters, 'nextToken');
  const status = getQueryParam(event.queryStringParameters, 'status');

  const result = await ProjectRepo.listByOrganization(organizationId, limit, nextToken);

  // Filter by status if provided
  let filteredItems = result.items;
  if (status) {
    filteredItems = result.items.filter(p => p.status === status);
  }

  return success({
    items: filteredItems.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      clientContact: project.clientContact,
      status: project.status,
      thumbnailUrl: project.thumbnailUrl,
      imageCount: project.imageCount,
      versionCount: project.versionCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      dueDate: project.dueDate,
      tags: project.tags,
    })),
    count: filteredItems.length,
    nextToken: result.nextToken,
  });
};

export const main = createHandler(handler).use(authMiddleware());
