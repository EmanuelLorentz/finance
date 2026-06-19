import type { Project } from '@finance/shared';

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Casamento',
    description: 'Planejamento e despesas do casamento em novembro de 2027',
    budget: 45000,
    deadline: '2027-11-20',
    impactsBalance: true,
    color: '#f472b6',
    createdAt: '2026-01-15',
  },
  {
    id: 'p2',
    name: 'Reforma da Cozinha',
    description: 'Renovação completa da cozinha com armários planejados',
    budget: 15000,
    deadline: '2026-10-15',
    impactsBalance: true,
    color: '#fb923c',
    createdAt: '2026-03-01',
  },
];
