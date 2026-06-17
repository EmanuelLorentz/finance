import type { Transaction } from './transaction';
import type { Goal } from './goal';
import type { UpcomingPayment } from './payment';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  balanceChangePercent: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  savingsChangePercent: number;
}

export interface BalanceHistoryEntry {
  month: string;
  balance: number;
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface FinancialIndicator {
  id: string;
  label: string;
  value: string;
  description: string;
  trend: 'positive' | 'negative' | 'neutral';
}

export interface DashboardData {
  summary: DashboardSummary;
  balanceHistory: BalanceHistoryEntry[];
  monthlyComparison: MonthlyComparison[];
  categoryExpenses: CategoryExpense[];
  recentTransactions: Transaction[];
  upcomingPayments: UpcomingPayment[];
  goals: Goal[];
  indicators: FinancialIndicator[];
}
