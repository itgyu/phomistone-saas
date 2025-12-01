/**
 * Search Projects Lambda
 * Supports searching by project name (GSI1) or client name (GSI4)
 *
 * Query Parameters:
 * - type: 'project' | 'client' (required)
 * - query: search term (required)
 * - limit: max results (optional, default 20)
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getRequiredQueryParam, getQueryParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo } from '../../lib/db/repository';
import type { SearchProjectsRequest, Project } from '../../types';

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

  // Get query parameters
  const searchType = getRequiredQueryParam(event.queryStringParameters, 'type') as 'project' | 'client';
  const query = getRequiredQueryParam(event.queryStringParameters, 'query');
  const limitParam = getQueryParam(event.queryStringParameters, 'limit', '20');
  const limit = Math.min(parseInt(limitParam || '20', 10), 100);

  // Validate search type
  if (searchType !== 'project' && searchType !== 'client') {
    throw Errors.badRequest("Search type must be 'project' or 'client'");
  }

  // Validate query
  if (query.length < 1) {
    throw Errors.badRequest('Search query must be at least 1 character');
  }

  let results: Project[];

  if (searchType === 'project') {
    // Search by project name using GSI1
    results = await ProjectRepo.searchByName(organizationId, query, limit);
  } else {
    // Search by client name using GSI4
    results = await ProjectRepo.searchByClient(organizationId, query, limit);
  }

  return success({
    searchType,
    query,
    count: results.length,
    items: results.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      status: project.status,
      thumbnailUrl: project.thumbnailUrl,
      imageCount: project.imageCount,
      versionCount: project.versionCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      dueDate: project.dueDate,
      tags: project.tags,
    })),
  });
};

export const main = createHandler(handler).use(authMiddleware());
