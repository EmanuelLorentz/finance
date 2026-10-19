import type { CategoryExpense, DashboardSummary, FinancialIndicator, TransactionType } from '@finance/shared';

export interface MetricTransaction {
  amount: number;
  type: TransactionType;
  date: string;
  categoryName: string;
  categoryColor: string;
}

interface Period {
  start: string;
  end: string;
}

const SAVINGS_RATE_REFERENCE = 20;
const EMERGENCY_MONTHS_REFERENCE = 3;
const CLOSED_MONTHS_IN_AVERAGE = 3;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}

export function previousComparableDate(today: string): string {
  const [year, month, day] = today.split('-').map(Number);
  const previous = shiftMonth(year, month, -1);
  const comparableDay = Math.min(day, lastDayOfMonth(previous.year, previous.month));
  return `${previous.year}-${pad(previous.month)}-${pad(comparableDay)}`;
}

function currentPeriod(today: string): Period {
  return { start: `${today.slice(0, 7)}-01`, end: today };
}

function previousPeriod(today: string): Period {
  const end = previousComparableDate(today);
  return { start: `${end.slice(0, 7)}-01`, end };
}

function historyStart(transactions: MetricTransaction[]): string | null {
  return transactions.reduce<string | null>((earliest, transaction) => {
    if (earliest === null || transaction.date < earliest) return transaction.date;
    return earliest;
  }, null);
}

function sumByType(transactions: MetricTransaction[], type: 'income' | 'expense', period: Period): number {
  return transactions.reduce((sum, transaction) => {
    if (transaction.type !== type) return sum;
    if (transaction.date < period.start || transaction.date > period.end) return sum;
    return sum + transaction.amount;
  }, 0);
}

function observedSum(
  transactions: MetricTransaction[],
  type: 'income' | 'expense',
  period: Period,
  firstDate: string | null,
): number | null {
  if (firstDate === null || firstDate > period.end) return null;
  return sumByType(transactions, type, period);
}

function balanceAsOf(transactions: MetricTransaction[], asOf: string, firstDate: string | null): number | null {
  if (firstDate === null || firstDate > asOf) return null;

  return transactions.reduce((sum, transaction) => {
    if (transaction.date > asOf) return sum;
    if (transaction.type === 'income') return sum + transaction.amount;
    if (transaction.type === 'expense') return sum - transaction.amount;
    return sum;
  }, 0);
}

// Null means the previous period was not observed. Zero is a real baseline:
// 0 against 0 is 0%, and a different current value has no finite percentage.
export function percentChange(current: number, previous: number | null): number | null {
  if (previous === null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function ratioPercent(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return (part / whole) * 100;
}

function formatDecimal(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

function closedMonthKeys(today: string, firstDate: string): string[] {
  const [year, month] = today.split('-').map(Number);
  const firstKey = firstDate.slice(0, 7);
  const keys: string[] = [];
  let cursor = shiftMonth(year, month, -1);

  while (monthKey(cursor.year, cursor.month) >= firstKey) {
    keys.push(monthKey(cursor.year, cursor.month));
    cursor = shiftMonth(cursor.year, cursor.month, -1);
  }

  return keys.slice(0, CLOSED_MONTHS_IN_AVERAGE);
}

function expenseInMonth(transactions: MetricTransaction[], key: string): number {
  return sumByType(transactions, 'expense', { start: `${key}-01`, end: `${key}-31` });
}

function averageClosedExpenses(transactions: MetricTransaction[], today: string, firstDate: string | null): number | null {
  if (firstDate === null) return null;
  const months = closedMonthKeys(today, firstDate);
  if (months.length === 0) return null;
  const total = months.reduce((sum, key) => sum + expenseInMonth(transactions, key), 0);
  return total / months.length;
}

function categoryExpenses(transactions: MetricTransaction[], period: Period): CategoryExpense[] {
  const totals = new Map<string, { amount: number; color: string }>();

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense') return;
    if (transaction.date < period.start || transaction.date > period.end) return;
    const current = totals.get(transaction.categoryName);
    totals.set(transaction.categoryName, {
      amount: (current?.amount ?? 0) + transaction.amount,
      color: transaction.categoryColor,
    });
  });

  const total = Array.from(totals.values()).reduce((sum, entry) => sum + entry.amount, 0);
  if (total === 0) return [];

  return Array.from(totals.entries())
    .map(([category, entry]) => ({
      category,
      amount: entry.amount,
      percentage: (entry.amount / total) * 100,
      color: entry.color,
    }))
    .sort((left, right) => right.amount - left.amount);
}

function buildIndicators(
  savingsRate: number | null,
  income: number,
  expenses: number,
  balance: number,
  averageExpenses: number | null,
  categories: CategoryExpense[],
): FinancialIndicator[] {
  const indicators: FinancialIndicator[] = [];

  if (savingsRate !== null) {
    indicators.push({
      id: 'savings-rate',
      label: 'Taxa de Poupança',
      value: `${formatDecimal(savingsRate)}%`,
      description: 'das entradas do mês que sobraram',
      trend: savingsRate >= SAVINGS_RATE_REFERENCE ? 'positive' : savingsRate < 0 ? 'negative' : 'neutral',
    });
  }

  const commitment = ratioPercent(expenses, income);
  if (commitment !== null) {
    indicators.push({
      id: 'income-commitment',
      label: 'Comprometimento da renda',
      value: `${formatDecimal(commitment)}%`,
      description: 'das entradas usadas em saídas',
      trend: commitment > 100 ? 'negative' : 'neutral',
    });
  }

  if (averageExpenses !== null && averageExpenses !== 0) {
    const coverage = balance / averageExpenses;
    indicators.push({
      id: 'emergency-coverage',
      label: 'Cobertura de Emergência',
      value: `${formatDecimal(coverage)} meses`,
      description: 'com a média das saídas dos meses fechados',
      trend: coverage >= EMERGENCY_MONTHS_REFERENCE ? 'positive' : coverage < 0 ? 'negative' : 'neutral',
    });
  }

  const topCategory = categories[0];
  if (topCategory) {
    indicators.push({
      id: 'top-category',
      label: 'Maior Category do mês',
      value: `${formatDecimal(topCategory.percentage)}%`,
      description: topCategory.category,
      trend: 'neutral',
    });
  }

  return indicators;
}

export function buildDashboardMetrics(transactions: MetricTransaction[], today: string): {
  summary: DashboardSummary;
  categoryExpenses: CategoryExpense[];
  indicators: FinancialIndicator[];
} {
  const firstDate = historyStart(transactions);
  const current = currentPeriod(today);
  const previous = previousPeriod(today);
  const monthlyIncome = sumByType(transactions, 'income', current);
  const monthlyExpenses = sumByType(transactions, 'expense', current);
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const totalBalance = balanceAsOf(transactions, today, firstDate) ?? 0;
  const previousBalance = balanceAsOf(transactions, previous.end, firstDate);
  const categories = categoryExpenses(transactions, current);
  const savingsRatePercent = ratioPercent(monthlySavings, monthlyIncome);

  return {
    summary: {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      balanceChangePercent: percentChange(totalBalance, previousBalance),
      incomeChangePercent: percentChange(monthlyIncome, observedSum(transactions, 'income', previous, firstDate)),
      expenseChangePercent: percentChange(monthlyExpenses, observedSum(transactions, 'expense', previous, firstDate)),
      savingsRatePercent,
    },
    categoryExpenses: categories,
    indicators: buildIndicators(
      savingsRatePercent,
      monthlyIncome,
      monthlyExpenses,
      totalBalance,
      averageClosedExpenses(transactions, today, firstDate),
      categories,
    ),
  };
}
