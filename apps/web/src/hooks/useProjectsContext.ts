import { useContext } from 'react';
import { ProjectsContext, type ProjectsContextValue } from '../contexts/projectsContext';

export function useProjectsContext(): ProjectsContextValue {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
}
