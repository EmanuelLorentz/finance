import { useState, useEffect, type ReactNode } from 'react';
import type { Project, CreateProjectData } from '@finance/shared';
import { fetchProjects, createProject } from '../services/projectService';
import { ProjectsContext } from './projectsContext';

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProjects([]);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
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
