import type { Project } from '@/types';

const STORAGE_KEY = 'phomistone_projects';

class ProjectService {
  getAll(): Promise<Project[]> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects = data ? JSON.parse(data) : [];
      resolve(projects);
    });
  }

  getById(id: string): Promise<Project | null> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects: Project[] = data ? JSON.parse(data) : [];
      const project = projects.find(p => p.id === id) || null;
      resolve(project);
    });
  }

  create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects: Project[] = data ? JSON.parse(data) : [];

      const newProject: Project = {
        ...project,
        id: `PRJ-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      projects.push(newProject);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      resolve(newProject);
    });
  }

  update(id: string, updates: Partial<Project>): Promise<Project | null> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects: Project[] = data ? JSON.parse(data) : [];
      const index = projects.findIndex(p => p.id === id);

      if (index === -1) {
        resolve(null);
        return;
      }

      projects[index] = {
        ...projects[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      resolve(projects[index]);
    });
  }

  delete(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const projects: Project[] = data ? JSON.parse(data) : [];
      const filtered = projects.filter(p => p.id !== id);

      if (filtered.length === projects.length) {
        resolve(false);
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      resolve(true);
    });
  }
}

export const projectService = new ProjectService();
