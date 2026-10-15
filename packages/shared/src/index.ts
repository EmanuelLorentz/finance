import { z } from 'zod';

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

export const transactionTypeSchema = z.enum(['income', 'expense', 'transfer']);

export const transactionSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number().nonnegative(),
  type: transactionTypeSchema,
  category: z.string(),
  date: z.string(),
  account: z.string(),
  projectId: z.string().optional(),
});

export const createTransactionSchema = transactionSchema.omit({ id: true });

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().min(1),
});

export const createCategorySchema = categorySchema.omit({ id: true });

export const accountSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

export const createAccountSchema = accountSchema.omit({ id: true });

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  deadline: z.string().optional(),
  impactsBalance: z.boolean(),
  color: z.string(),
  createdAt: z.string(),
});

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
});

export const goalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  deadline: z.string(),
  category: z.string(),
});

export const upcomingPaymentSchema = z.object({
  id: z.string(),
  description: z.string(),
  amount: z.number().nonnegative(),
  dueDate: z.string(),
  category: z.string(),
  isPaid: z.boolean(),
});

export const dashboardSummarySchema = z.object({
  totalBalance: z.number(),
  monthlyIncome: z.number(),
  monthlyExpenses: z.number(),
  monthlySavings: z.number(),
  balanceChangePercent: z.number(),
  incomeChangePercent: z.number(),
  expenseChangePercent: z.number(),
  savingsChangePercent: z.number(),
});

export const balanceHistoryEntrySchema = z.object({
  month: z.string(),
  balance: z.number(),
});

export const monthlyComparisonSchema = z.object({
  month: z.string(),
  income: z.number(),
  expense: z.number(),
});

export const categoryExpenseSchema = z.object({
  category: z.string(),
  amount: z.number(),
  percentage: z.number(),
  color: z.string(),
});

export const financialIndicatorSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  description: z.string(),
  trend: z.enum(['positive', 'negative', 'neutral']),
});

export const dashboardDataSchema = z.object({
  summary: dashboardSummarySchema,
  balanceHistory: z.array(balanceHistoryEntrySchema),
  monthlyComparison: z.array(monthlyComparisonSchema),
  categoryExpenses: z.array(categoryExpenseSchema),
  recentTransactions: z.array(transactionSchema),
  upcomingPayments: z.array(upcomingPaymentSchema),
  goals: z.array(goalSchema),
  indicators: z.array(financialIndicatorSchema),
});

export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransactionData = z.infer<typeof createTransactionSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type Account = z.infer<typeof accountSchema>;
export type CreateAccountData = z.infer<typeof createAccountSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type UpcomingPayment = z.infer<typeof upcomingPaymentSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
export type BalanceHistoryEntry = z.infer<typeof balanceHistoryEntrySchema>;
export type MonthlyComparison = z.infer<typeof monthlyComparisonSchema>;
export type CategoryExpense = z.infer<typeof categoryExpenseSchema>;
export type FinancialIndicator = z.infer<typeof financialIndicatorSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
