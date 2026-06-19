import type { DashboardData } from '@finance/shared';
import { mockTransactions } from './transactions';
import { mockGoals } from './goals';
import { mockUpcomingPayments } from './payments';

export const mockDashboardData: DashboardData = {
  summary: {
    totalBalance: 24580,
    monthlyIncome: 9700,
    monthlyExpenses: 5340,
    monthlySavings: 2860,
    balanceChangePercent: 2.9,
    incomeChangePercent: 18.3,
    expenseChangePercent: -4.2,
    savingsChangePercent: 12.1,
  },
  balanceHistory: [
    { month: 'Jan', balance: 18200 },
    { month: 'Fev', balance: 20100 },
    { month: 'Mar', balance: 21450 },
    { month: 'Abr', balance: 22800 },
    { month: 'Mai', balance: 23900 },
    { month: 'Jun', balance: 24580 },
  ],
  monthlyComparison: [
    { month: 'Jan', income: 8200, expense: 5800 },
    { month: 'Fev', income: 8200, expense: 5650 },
    { month: 'Mar', income: 8700, expense: 6100 },
    { month: 'Abr', income: 8200, expense: 5400 },
    { month: 'Mai', income: 8200, expense: 5550 },
    { month: 'Jun', income: 9700, expense: 5340 },
  ],
  categoryExpenses: [
    { category: 'Moradia', amount: 1800, percentage: 33.7, color: '#60a5fa' },
    { category: 'Alimentação', amount: 850, percentage: 15.9, color: '#4ade80' },
    { category: 'Transporte', amount: 320, percentage: 6.0, color: '#fbbf24' },
    { category: 'Saúde', amount: 210, percentage: 3.9, color: '#f87171' },
    { category: 'Educação', amount: 480, percentage: 9.0, color: '#a78bfa' },
    { category: 'Assinaturas', amount: 280, percentage: 5.2, color: '#38bdf8' },
    { category: 'Lazer', amount: 400, percentage: 7.5, color: '#fb923c' },
    { category: 'Outros', amount: 1000, percentage: 18.7, color: '#6b7280' },
  ],
  recentTransactions: mockTransactions,
  upcomingPayments: mockUpcomingPayments,
  goals: mockGoals,
  indicators: [
    {
      id: '1',
      label: 'Taxa de Poupança',
      value: '29,5%',
      description: 'do rendimento mensal poupado',
      trend: 'positive',
    },
    {
      id: '2',
      label: 'Cobertura de Emergência',
      value: '4,6 meses',
      description: 'de despesas cobertas',
      trend: 'neutral',
    },
    {
      id: '3',
      label: 'Score Financeiro',
      value: '78/100',
      description: 'saúde financeira geral',
      trend: 'positive',
    },
    {
      id: '4',
      label: 'Crescimento Patrimonial',
      value: '+2,9%',
      description: 'em relação ao mês anterior',
      trend: 'positive',
    },
  ],
};
