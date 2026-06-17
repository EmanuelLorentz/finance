import type { UpcomingPayment } from '../types/payment';

export const mockUpcomingPayments: UpcomingPayment[] = [
  {
    id: '1',
    description: 'Aluguel',
    amount: 1800,
    dueDate: '2026-06-25',
    category: 'Moradia',
    isPaid: false,
  },
  {
    id: '2',
    description: 'Netflix',
    amount: 45.9,
    dueDate: '2026-06-28',
    category: 'Assinaturas',
    isPaid: false,
  },
  {
    id: '3',
    description: 'Internet Vivo',
    amount: 119.9,
    dueDate: '2026-07-02',
    category: 'Assinaturas',
    isPaid: false,
  },
  {
    id: '4',
    description: 'Plano de Saúde',
    amount: 380,
    dueDate: '2026-07-05',
    category: 'Saúde',
    isPaid: false,
  },
  {
    id: '5',
    description: 'Seguro Automóvel',
    amount: 218.5,
    dueDate: '2026-07-10',
    category: 'Transporte',
    isPaid: false,
  },
];
