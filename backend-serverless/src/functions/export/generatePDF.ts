/**
 * Generate PDF Lambda
 * Creates a PDF report for a project or styling version
 */

import type { APIGatewayProxyResult, Context } from 'aws-lambda';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import { createHandler, ExtendedAPIGatewayProxyEvent } from '../../lib/utils/handler';
import { success, getPathParam, getQueryParam } from '../../lib/utils/response';
import { Errors } from '../../lib/utils/errors';
import { authMiddleware } from '../../lib/middleware/auth';
import {
  ProjectRepo,
  ProjectImageRepo,
  StylingVersionRepo,
  StylingRegionMaterialRepo,
  MaterialRepo,
} from '../../lib/db/repository';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

const S3_BUCKET = process.env.S3_BUCKET || 'phomistone-exports';

interface AuthenticatedEvent extends ExtendedAPIGatewayProxyEvent {
  auth: {
    userId: string;
    organizationId: string;
    role: 'Owner' | 'Editor' | 'Viewer';
  };
}

interface PDFOptions {
  includeImages: boolean;
  includeMaterials: boolean;
  includeMetadata: boolean;
  language: 'ko' | 'en';
}

/**
 * Generate PDF buffer using pdfkit
 */
const generatePDFBuffer = async (
  project: Awaited<ReturnType<typeof ProjectRepo.getById>>,
  images: Awaited<ReturnType<typeof ProjectImageRepo.listByProject>>,
  versions: Map<string, Awaited<ReturnType<typeof StylingVersionRepo.listByImage>>>,
  materials: Map<string, Awaited<ReturnType<typeof MaterialRepo.getById>>>,
  options: PDFOptions
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `${project?.name} - Styling Report`,
          Author: 'Phomistone',
          Subject: 'Interior Styling Report',
          Creator: 'Phomistone SaaS',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('Phomistone', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text('Interior Styling Report', { align: 'center' });
      doc.moveDown(2);

      // Project Info
      doc.fontSize(18).font('Helvetica-Bold').text(options.language === 'ko' ? '프로젝트 정보' : 'Project Information');
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica');

      const projectInfo = [
        [options.language === 'ko' ? '프로젝트명' : 'Project Name', project?.name || '-'],
        [options.language === 'ko' ? '고객명' : 'Client', project?.clientName || '-'],
        [options.language === 'ko' ? '상태' : 'Status', project?.status || '-'],
        [options.language === 'ko' ? '생성일' : 'Created', project?.createdAt?.split('T')[0] || '-'],
        [options.language === 'ko' ? '이미지 수' : 'Images', `${images.length}`],
      ];

      projectInfo.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`);
      });

      doc.moveDown(2);

      // Images and Versions
      if (options.includeImages && images.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text(options.language === 'ko' ? '이미지 및 시안' : 'Images & Versions');
        doc.moveDown(1);

        images.forEach((image, imageIndex) => {
          doc.fontSize(14).font('Helvetica-Bold').text(`${imageIndex + 1}. ${image.name}`);
          doc.fontSize(10).font('Helvetica').text(`${options.language === 'ko' ? '상태' : 'Status'}: ${image.segmentationStatus}`);

          const imageVersions = versions.get(image.id) || [];
          if (imageVersions.length > 0) {
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').text(options.language === 'ko' ? '시안 목록:' : 'Versions:');

            imageVersions.forEach((version, versionIndex) => {
              doc.fontSize(10).font('Helvetica');
              doc.text(`  ${versionIndex + 1}. ${version.name} (${version.renderStatus})`);
            });
          }

          doc.moveDown(1);
        });
      }

      // Materials Summary
      if (options.includeMaterials && materials.size > 0) {
        doc.addPage();
        doc.fontSize(18).font('Helvetica-Bold').text(options.language === 'ko' ? '사용된 자재' : 'Materials Used');
        doc.moveDown(1);

        let materialIndex = 1;
        materials.forEach((material) => {
          if (material) {
            doc.fontSize(12).font('Helvetica-Bold').text(`${materialIndex}. ${material.name}`);
            doc.fontSize(10).font('Helvetica');
            doc.text(`  ${options.language === 'ko' ? '카테고리' : 'Category'}: ${material.category}`);
            doc.text(`  ${options.language === 'ko' ? '브랜드' : 'Brand'}: ${material.brand || '-'}`);
            doc.text(`  ${options.language === 'ko' ? '제품코드' : 'Code'}: ${material.productCode || '-'}`);
            if (material.colorHex) {
              doc.text(`  ${options.language === 'ko' ? '색상' : 'Color'}: ${material.colorHex}`);
            }
            doc.moveDown(0.5);
            materialIndex++;
          }
        });
      }

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        `Generated by Phomistone | ${new Date().toISOString().split('T')[0]}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const handler = async (
  event: AuthenticatedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { organizationId } = event.auth;
  const projectId = getPathParam(event.pathParameters, 'projectId');

  // Get options from query params
  const options: PDFOptions = {
    includeImages: getQueryParam(event.queryStringParameters, 'includeImages', 'true') === 'true',
    includeMaterials: getQueryParam(event.queryStringParameters, 'includeMaterials', 'true') === 'true',
    includeMetadata: getQueryParam(event.queryStringParameters, 'includeMetadata', 'true') === 'true',
    language: (getQueryParam(event.queryStringParameters, 'language', 'ko') as 'ko' | 'en'),
  };

  // Get project
  const project = await ProjectRepo.getById(organizationId, projectId);
  if (!project) {
    throw Errors.notFound('Project', projectId);
  }

  // Get images
  const images = await ProjectImageRepo.listByProject(projectId);

  // Get versions for each image
  const versionsMap = new Map<string, Awaited<ReturnType<typeof StylingVersionRepo.listByImage>>>();
  const materialsMap = new Map<string, Awaited<ReturnType<typeof MaterialRepo.getById>>>();

  for (const image of images) {
    const versions = await StylingVersionRepo.listByImage(image.id);
    versionsMap.set(image.id, versions);

    // Get materials from versions
    for (const version of versions) {
      const regionMaterials = await StylingRegionMaterialRepo.listByVersion(version.id);
      for (const rm of regionMaterials) {
        if (!materialsMap.has(rm.materialId)) {
          const material = await MaterialRepo.getById(rm.materialId);
          if (material) {
            materialsMap.set(rm.materialId, material);
          }
        }
      }
    }
  }

  // Generate PDF
  const pdfBuffer = await generatePDFBuffer(project, images, versionsMap, materialsMap, options);

  // Upload to S3
  const s3Key = `exports/${organizationId}/${projectId}/${uuidv4()}.pdf`;

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    Metadata: {
      projectId,
      organizationId,
      generatedAt: new Date().toISOString(),
    },
  }));

  // Generate signed URL for download (valid for 1 hour)
  const signedUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    }),
    { expiresIn: 3600 }
  );

  return success({
    downloadUrl: signedUrl,
    expiresIn: 3600,
    fileName: `${project.name}_report.pdf`,
    fileSize: pdfBuffer.length,
    generatedAt: new Date().toISOString(),
  });
};

export const main = createHandler(handler).use(authMiddleware());
