import { createContext } from 'react';
import type { CreateProjectData, Project } from '@finance/shared';

export interface ProjectsContextValue {
  projects: Project[];
  isLoading: boolean;
  addProject: (data: CreateProjectData) => Promise<Project>;
}

export const ProjectsContext = createContext<ProjectsContextValue | null>(null);
