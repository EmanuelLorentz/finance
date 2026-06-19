import type { Project } from '@finance/shared';
import type { Transaction } from '@finance/shared';

export interface ProjectStats {
  totalExpenses: number;
  totalIncome: number;
  remaining: number | undefined;
  progressPercent: number | undefined;
  daysRemaining: number | undefined;
  monthlyAverage: number;
  estimatedCompletion: 'on_track' | 'at_risk' | 'over_budget' | 'no_budget';
}

export interface ProjectEvolutionEntry {
  month: string;
  cumulative: number;
  budget: number | undefined;
}

export function computeProjectStats(project: Project, transactions: Transaction[]): ProjectStats {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

  const remaining = project.budget !== undefined ? project.budget - totalExpenses : undefined;
  const progressPercent =
    project.budget !== undefined ? (totalExpenses / project.budget) * 100 : undefined;

  let daysRemaining: number | undefined;
  if (project.deadline) {
    const [y, m, d] = project.deadline.split('-').map(Number);
    const deadline = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  let monthsElapsed = 1;
  if (transactions.length > 0) {
    const firstDate = transactions.map((t) => t.date).sort()[0];
    const [fy, fm] = firstDate.split('-').map(Number);
    const today = new Date();
    monthsElapsed = Math.max(
      1,
      (today.getFullYear() - fy) * 12 + (today.getMonth() + 1 - fm) + 1,
    );
  }
  const monthlyAverage = totalExpenses / monthsElapsed;

  let estimatedCompletion: ProjectStats['estimatedCompletion'] = 'no_budget';
  if (project.budget !== undefined && daysRemaining !== undefined && remaining !== undefined) {
    if (remaining < 0) {
      estimatedCompletion = 'over_budget';
    } else {
      const monthsRemaining = daysRemaining / 30;
      const projectedAdditional = monthlyAverage * monthsRemaining;
      estimatedCompletion = projectedAdditional > remaining ? 'at_risk' : 'on_track';
    }
  }

  return {
    totalExpenses,
    totalIncome,
    remaining,
    progressPercent,
    daysRemaining,
    monthlyAverage,
    estimatedCompletion,
  };
}

export function computeEvolutionData(
  transactions: Transaction[],
  budget: number | undefined,
): ProjectEvolutionEntry[] {
  const expenses = transactions.filter((t) => t.type === 'expense');

  const monthlyMap = new Map<string, number>();
  expenses.forEach((t) => {
    const [year, month] = t.date.split('-');
    const key = `${year}-${month}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + t.amount);
  });

  const sortedKeys = Array.from(monthlyMap.keys()).sort();
  let cumulative = 0;

  return sortedKeys.map((key) => {
    cumulative += monthlyMap.get(key) ?? 0;
    const [year, month] = key.split('-').map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    });
    return { month: label, cumulative, budget };
  });
}
