/**
 * Get Project Lambda
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getPathParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import { ProjectRepo, ProjectImageRepo, StylingVersionRepo } from '../../lib/db/repository';

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
  const projectId = getPathParam(event.pathParameters, 'projectId');

  const project = await ProjectRepo.getById(organizationId, projectId);

  if (!project) {
    throw Errors.notFound('Project', projectId);
  }

  // Fetch associated images
  const images = await ProjectImageRepo.listByProject(projectId);

  // Fetch versions for each image
  const imagesWithVersions = await Promise.all(
    images.map(async (image) => {
      const versions = await StylingVersionRepo.listByImage(image.id);
      return {
        ...image,
        versions: versions.map(v => ({
          id: v.id,
          name: v.name,
          versionNumber: v.versionNumber,
          resultImageUrl: v.resultImageUrl,
          thumbnailUrl: v.thumbnailUrl,
          renderStatus: v.renderStatus,
          isDefault: v.isDefault,
          createdAt: v.createdAt,
        })),
      };
    })
  );

  return success({
    ...project,
    images: imagesWithVersions,
  });
};

export const main = createHandler(handler).use(authMiddleware());
