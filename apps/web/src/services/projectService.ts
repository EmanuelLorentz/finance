import type { Project, CreateProjectData, Transaction } from '@finance/shared';
import { httpClient } from './httpClient';

export async function fetchProjects(): Promise<Project[]> {
  return httpClient.get<Project[]>('/projects');
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  return httpClient.get<Project>(`/projects/${id}`);
}

export async function fetchProjectTransactions(projectId: string): Promise<Transaction[]> {
  return httpClient.get<Transaction[]>(`/projects/${projectId}/transactions`);
}

export async function createProject(data: CreateProjectData): Promise<Project> {
  return httpClient.post<Project>('/projects', data);
}
