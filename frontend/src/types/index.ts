// Export all project types
export * from './project';

// Legacy Project interface for backward compatibility
export interface LegacyProject {
  id: string;
  clientName: string;
  materialName: string;
  beforeImage: string;
  afterImage: string;
  estimatedCost: number;
  status: 'Draft' | 'Proposal' | 'Contract' | 'Construction';
  createdAt: string;
  updatedAt: string;
}
