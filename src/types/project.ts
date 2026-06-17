export const PROJECT_COLORS = [
  '#60a5fa',
  '#4ade80',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#38bdf8',
  '#fb923c',
  '#f472b6',
] as const;

export interface Project {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  deadline?: string;
  impactsBalance: boolean;
  color: string;
  createdAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  budget?: number;
  deadline?: string;
  impactsBalance: boolean;
  color: string;
}
