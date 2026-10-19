import type { FastifyInstance } from 'fastify';
import type { BalanceHistoryEntry, DashboardData, MonthlyComparison } from '@finance/shared';
import { markdownStore } from '../../db/markdownStore.js';
import { joinTransactions, presentGoal, presentUpcomingPayment } from '../../db/present.js';
import { mapTransaction, toDateOnly, todayDateOnly } from '../../utils/mappers.js';
import { buildDashboardMetrics } from './dashboardMetrics.js';

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard', async (): Promise<DashboardData> => {
    const snapshot = await markdownStore.readSnapshot();
    const transactions = joinTransactions(snapshot);
    const goals = [...snapshot.goals].sort((left, right) => left.deadline.localeCompare(right.deadline));
    const upcomingPayments = snapshot.upcomingPayments
      .filter((payment) => !payment.isPaid)
      .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

    const balanceTransactions = transactions.filter(
      (transaction) => !transaction.project || transaction.project.impactsBalance,
    );
    const mappedTransactions = transactions.map(mapTransaction);

    const metrics = buildDashboardMetrics(
      balanceTransactions.map((transaction) => ({
        amount: Number(transaction.amount),
        type: transaction.type,
        date: toDateOnly(transaction.date),
        categoryName: transaction.category.name,
        categoryColor: transaction.category.color,
      })),
      todayDateOnly(),
    );

    const monthlyComparisonMap = new Map<string, MonthlyComparison>();
    const balanceHistoryMap = new Map<string, BalanceHistoryEntry>();

    [...balanceTransactions].reverse().forEach((transaction) => {
      const key = monthKey(transaction.date);
      const label = monthLabel(transaction.date);
      const comparison = monthlyComparisonMap.get(key) ?? {
        month: label,
        income: 0,
        expense: 0,
      };

      if (transaction.type === 'income') comparison.income += Number(transaction.amount);
      if (transaction.type === 'expense') comparison.expense += Number(transaction.amount);
      monthlyComparisonMap.set(key, comparison);
    });

    let cumulative = 0;
    Array.from(monthlyComparisonMap.entries()).forEach(([key, comparison]) => {
      cumulative += comparison.income - comparison.expense;
      balanceHistoryMap.set(key, {
        month: comparison.month,
        balance: cumulative,
      });
    });

    return {
      summary: metrics.summary,
      balanceHistory: Array.from(balanceHistoryMap.values()).slice(-6),
      monthlyComparison: Array.from(monthlyComparisonMap.values()).slice(-6),
      categoryExpenses: metrics.categoryExpenses,
      recentTransactions: mappedTransactions.slice(0, 10),
      upcomingPayments: upcomingPayments.map(presentUpcomingPayment),
      goals: goals.map(presentGoal),
      indicators: metrics.indicators,
    };
  });
}
