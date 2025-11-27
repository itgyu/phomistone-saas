export interface Project {
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
