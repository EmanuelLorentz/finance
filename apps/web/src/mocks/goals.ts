import type { Goal } from '@finance/shared';

export const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Reserva de Emergência',
    targetAmount: 50000,
    currentAmount: 24000,
    deadline: '2026-12-31',
    category: 'Segurança',
  },
  {
    id: '2',
    name: 'Viagem para Europa',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: '2027-07-01',
    category: 'Lazer',
  },
  {
    id: '3',
    name: 'Novo Notebook',
    targetAmount: 5500,
    currentAmount: 4200,
    deadline: '2026-09-01',
    category: 'Tecnologia',
  },
  {
    id: '4',
    name: 'Previdência Privada',
    targetAmount: 500000,
    currentAmount: 85000,
    deadline: '2046-06-01',
    category: 'Aposentadoria',
  },
];
