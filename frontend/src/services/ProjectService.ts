/**
 * ProjectService - 백엔드 API 연동
 * localStorage 제거하고 DynamoDB 백엔드 사용
 */

import { apiClient } from './ApiClient';
import type { Project, ProjectStatus } from '@/types';

// 백엔드 API 응답 타입
interface ProjectListResponse {
  items: Project[];
  count: number;
  nextToken?: string;
}

interface BackendProject {
  id: string;
  name: string;
  description?: string;
  clientName?: string;
  clientContact?: string;
  status: string;
  thumbnailUrl?: string;
  imageCount?: number;
  versionCount?: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}

// 백엔드 상태를 프론트엔드 상태로 매핑
function mapStatus(backendStatus: string): ProjectStatus {
  const statusMap: Record<string, ProjectStatus> = {
    'DRAFT': 'draft',
    'ESTIMATE': 'estimate',
    'PROPOSAL': 'proposal',
    'CONTRACT': 'contract',
    'CONSTRUCTION': 'construction',
    'COMPLETED': 'completed',
  };
  return statusMap[backendStatus] || 'draft';
}

// 프론트엔드 상태를 백엔드 상태로 매핑
function mapStatusToBackend(frontendStatus: ProjectStatus): string {
  const statusMap: Record<ProjectStatus, string> = {
    'draft': 'DRAFT',
    'estimate': 'ESTIMATE',
    'proposal': 'PROPOSAL',
    'contract': 'CONTRACT',
    'construction': 'CONSTRUCTION',
    'completed': 'COMPLETED',
  };
  return statusMap[frontendStatus] || 'DRAFT';
}

// 백엔드 프로젝트를 프론트엔드 형식으로 변환
function transformProject(bp: BackendProject): Project {
  return {
    id: bp.id,
    name: bp.name,
    clientName: bp.clientName,
    siteAddress: bp.description, // description을 siteAddress로 사용
    status: mapStatus(bp.status),
    thumbnail: bp.thumbnailUrl,
    createdAt: bp.createdAt,
    updatedAt: bp.updatedAt,
  };
}

class ProjectService {
  /**
   * 프로젝트 목록 조회
   */
  async getAll(options?: { status?: ProjectStatus; limit?: number; nextToken?: string }): Promise<Project[]> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', mapStatusToBackend(options.status));
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.nextToken) params.append('nextToken', options.nextToken);

      const queryString = params.toString();
      const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ProjectListResponse>(endpoint);
      return response.items.map(transformProject);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // API 실패 시 빈 배열 반환 (에러 무시하지 않고 로깅)
      throw error;
    }
  }

  /**
   * 단일 프로젝트 조회
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const response = await apiClient.get<BackendProject>(`/projects/${id}`);
      return transformProject(response);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      return null;
    }
  }

  /**
   * 프로젝트 생성
   */
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const requestBody = {
      name: project.name,
      clientName: project.clientName || 'Unknown Client',
      description: project.siteAddress,
      status: mapStatusToBackend(project.status),
    };

    const response = await apiClient.post<BackendProject>('/projects', requestBody);
    return transformProject(response);
  }

  /**
   * 프로젝트 수정
   */
  async update(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const requestBody: Record<string, unknown> = {};

      if (updates.name !== undefined) requestBody.name = updates.name;
      if (updates.clientName !== undefined) requestBody.clientName = updates.clientName;
      if (updates.siteAddress !== undefined) requestBody.description = updates.siteAddress;
      if (updates.status !== undefined) requestBody.status = mapStatusToBackend(updates.status);

      const response = await apiClient.put<BackendProject>(`/projects/${id}`, requestBody);
      return transformProject(response);
    } catch (error) {
      console.error('Failed to update project:', error);
      return null;
    }
  }

  /**
   * 프로젝트 삭제
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/projects/${id}`);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  /**
   * 프로젝트 검색
   */
  async search(query: string): Promise<Project[]> {
    try {
      const params = new URLSearchParams({ q: query });
      const response = await apiClient.get<ProjectListResponse>(`/projects/search?${params}`);
      return response.items.map(transformProject);
    } catch (error) {
      console.error('Failed to search projects:', error);
      return [];
    }
  }
}

export const projectService = new ProjectService();
