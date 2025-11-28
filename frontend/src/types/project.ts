export type ProjectStatus =
  | 'draft'         // 작성 중
  | 'estimate'      // 견적
  | 'proposal'      // 제안
  | 'contract'      // 계약
  | 'construction'  // 시공 중
  | 'completed';    // 완료

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  siteAddress?: string;
  status: ProjectStatus;
  estimatedCost?: number;
  materialName?: string;
  beforeImage?: string;
  afterImage?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ProjectStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  nextStatus: ProjectStatus | null;
  nextLabel: string | null;
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, ProjectStatusConfig> = {
  draft: {
    label: '작성 중',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    nextStatus: 'estimate',
    nextLabel: '견적으로 전환'
  },
  estimate: {
    label: '견적',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    nextStatus: 'proposal',
    nextLabel: '제안으로 전환'
  },
  proposal: {
    label: '제안',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    nextStatus: 'contract',
    nextLabel: '계약으로 전환'
  },
  contract: {
    label: '계약',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    nextStatus: 'construction',
    nextLabel: '시공으로 전환'
  },
  construction: {
    label: '시공 중',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    nextStatus: 'completed',
    nextLabel: '완료로 전환'
  },
  completed: {
    label: '완료',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    nextStatus: null,
    nextLabel: null
  }
} as const;

// 상태 흐름 헬퍼 함수
export function getNextStatus(currentStatus: ProjectStatus): ProjectStatus | null {
  return PROJECT_STATUS_CONFIG[currentStatus].nextStatus;
}

export function getStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_CONFIG[status].label;
}

export function getStatusIndex(status: ProjectStatus): number {
  const statuses: ProjectStatus[] = ['draft', 'estimate', 'proposal', 'contract', 'construction', 'completed'];
  return statuses.indexOf(status);
}

export function isStatusCompleted(status: ProjectStatus, comparedTo: ProjectStatus): boolean {
  return getStatusIndex(status) > getStatusIndex(comparedTo);
}
