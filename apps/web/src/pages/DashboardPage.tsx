import { Wallet, TrendingUp, TrendingDown, Banknote } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { BalanceChart } from '../components/dashboard/BalanceChart';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryDistributionChart } from '../components/dashboard/CategoryDistributionChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { UpcomingPayments } from '../components/dashboard/UpcomingPayments';
import { FinancialGoals } from '../components/dashboard/FinancialGoals';
import { FinancialIndicators } from '../components/dashboard/FinancialIndicators';

export function DashboardPage() {
  const { data, isLoading, hasError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-secondary text-sm">Carregando...</p>
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-negative text-sm">Erro ao carregar dados.</p>
      </div>
    );
  }

  const {
    summary,
    balanceHistory,
    monthlyComparison,
    categoryExpenses,
    recentTransactions,
    upcomingPayments,
    goals,
    indicators,
  } = data;

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
        <p className="text-xs text-secondary mt-0.5 capitalize">{currentDate}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Saldo Total"
          value={summary.totalBalance}
          changePercent={summary.balanceChangePercent}
          icon={Wallet}
        />
        <SummaryCard
          title="Entradas do Mês"
          value={summary.monthlyIncome}
          changePercent={summary.incomeChangePercent}
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          title="Saídas do Mês"
          value={summary.monthlyExpenses}
          changePercent={summary.expenseChangePercent}
          icon={TrendingDown}
          variant="expense"
          reading="lower-is-better"
        />
        <SummaryCard
          title="Economia do Mês"
          value={summary.monthlySavings}
          changePercent={summary.savingsRatePercent}
          icon={Banknote}
          variant="savings"
          reading="share"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BalanceChart data={balanceHistory} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDistributionChart data={categoryExpenses} />
        </div>
      </div>

      <IncomeExpenseChart data={monthlyComparison} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTransactions transactions={recentTransactions} />
        <UpcomingPayments payments={upcomingPayments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <FinancialGoals goals={goals} />
        </div>
        <div className="lg:col-span-1">
          <FinancialIndicators indicators={indicators} />
        </div>
      </div>
    </div>
  );
}
