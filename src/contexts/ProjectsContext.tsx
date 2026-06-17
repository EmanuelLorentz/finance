import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, CreateProjectData } from '../types/project';
import { fetchProjects, createProject } from '../services/projectService';

interface ProjectsContextValue {
  projects: Project[];
  isLoading: boolean;
  addProject: (data: CreateProjectData) => Promise<Project>;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects().then((data) => {
      setProjects(data);
      setIsLoading(false);
    });
  }, []);

  async function addProject(data: CreateProjectData): Promise<Project> {
    const newProject = await createProject(data);
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }

  return (
    <ProjectsContext.Provider value={{ projects, isLoading, addProject }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjectsContext(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
}
