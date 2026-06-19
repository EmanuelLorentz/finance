import type { Project, CreateProjectData } from '@finance/shared';
import type { Transaction } from '@finance/shared';
import { mockProjects } from '../mocks/projects';
import { mockProjectTransactions } from '../mocks/projectTransactions';
import { httpClient } from './httpClient';

export async function fetchProjects(): Promise<Project[]> {
  try {
    return await httpClient.get<Project[]>('/projects');
  } catch {
    return mockProjects;
  }
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  try {
    return await httpClient.get<Project>(`/projects/${id}`);
  } catch {
    return mockProjects.find((p) => p.id === id) ?? null;
  }
}

export async function fetchProjectTransactions(projectId: string): Promise<Transaction[]> {
  try {
    return await httpClient.get<Transaction[]>(`/projects/${projectId}/transactions`);
  } catch {
    return mockProjectTransactions.filter((t) => t.projectId === projectId);
  }
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  try {
    return await httpClient.post<Project>('/projects', data);
  } catch {
    return {
      ...data,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
  }
}
