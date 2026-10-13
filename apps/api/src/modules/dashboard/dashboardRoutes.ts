import type { FastifyInstance } from 'fastify';
import type {
  BalanceHistoryEntry,
  CategoryExpense,
  DashboardData,
  MonthlyComparison,
  Transaction,
} from '@finance/shared';
import { markdownStore } from '../../db/markdownStore.js';
import { joinTransactions, presentGoal, presentUpcomingPayment } from '../../db/present.js';
import { mapTransaction, parseDateOnly } from '../../utils/mappers.js';

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
}

function isCurrentMonth(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
}

function calculateNetBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'income') return total + transaction.amount;
    if (transaction.type === 'expense') return total - transaction.amount;
    return total;
  }, 0);
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
    const mappedBalanceTransactions = balanceTransactions.map(mapTransaction);
    const mappedTransactions = transactions.map(mapTransaction);

    const currentMonthTransactions = mappedBalanceTransactions.filter((transaction) =>
      isCurrentMonth(parseDateOnly(transaction.date)),
    );

    const monthlyIncome = currentMonthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const categoryTotals = new Map<string, { amount: number; color: string }>();
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const current = categoryTotals.get(transaction.category.name);
        categoryTotals.set(transaction.category.name, {
          amount: (current?.amount ?? 0) + Number(transaction.amount),
          color: transaction.category.color,
        });
      });

    const totalCategoryExpenses = Array.from(categoryTotals.values()).reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    const categoryExpenses: CategoryExpense[] = Array.from(categoryTotals.entries())
      .map(([category, entry]) => ({
        category,
        amount: entry.amount,
        percentage: totalCategoryExpenses > 0 ? (entry.amount / totalCategoryExpenses) * 100 : 0,
        color: entry.color,
      }))
      .sort((a, b) => b.amount - a.amount);

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

    const totalBalance = calculateNetBalance(mappedBalanceTransactions);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    return {
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        balanceChangePercent: 2.9,
        incomeChangePercent: 18.3,
        expenseChangePercent: -4.2,
        savingsChangePercent: 12.1,
      },
      balanceHistory: Array.from(balanceHistoryMap.values()).slice(-6),
      monthlyComparison: Array.from(monthlyComparisonMap.values()).slice(-6),
      categoryExpenses,
      recentTransactions: mappedTransactions.slice(0, 10),
      upcomingPayments: upcomingPayments.map(presentUpcomingPayment),
      goals: goals.map(presentGoal),
      indicators: [
        {
          id: 'savings-rate',
          label: 'Taxa de Poupança',
          value: `${savingsRate.toFixed(1).replace('.', ',')}%`,
          description: 'do rendimento mensal poupado',
          trend: savingsRate >= 20 ? 'positive' : 'neutral',
        },
        {
          id: 'emergency-coverage',
          label: 'Cobertura de Emergência',
          value: monthlyExpenses > 0 ? `${(totalBalance / monthlyExpenses).toFixed(1)} meses` : '—',
          description: 'de despesas cobertas',
          trend: 'neutral',
        },
        {
          id: 'financial-score',
          label: 'Score Financeiro',
          value: savingsRate >= 20 ? '82/100' : '68/100',
          description: 'saúde financeira geral',
          trend: savingsRate >= 20 ? 'positive' : 'neutral',
        },
        {
          id: 'wealth-growth',
          label: 'Crescimento Patrimonial',
          value: '+2,9%',
          description: 'em relação ao mês anterior',
          trend: 'positive',
        },
      ],
    };
  });
}
