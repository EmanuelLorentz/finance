import type { Project, CreateProjectData } from '../types/project';
import type { Transaction } from '../types/transaction';
import { mockProjects } from '../mocks/projects';
import { mockProjectTransactions } from '../mocks/projectTransactions';

// Stubs for future REST API integration

export async function fetchProjects(): Promise<Project[]> {
  return Promise.resolve(mockProjects);
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  return Promise.resolve(mockProjects.find((p) => p.id === id) ?? null);
}

export async function fetchProjectTransactions(projectId: string): Promise<Transaction[]> {
  return Promise.resolve(mockProjectTransactions.filter((t) => t.projectId === projectId));
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  const newProject: Project = {
    ...data,
    id: `p${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
  };
  return Promise.resolve(newProject);
}
