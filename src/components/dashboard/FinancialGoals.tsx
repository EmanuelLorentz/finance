import type { Goal } from '../../types/goal';
import { formatCurrency, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';

function getProgress(currentAmount: number, targetAmount: number): number {
  return Math.min((currentAmount / targetAmount) * 100, 100);
}

interface FinancialGoalsProps {
  goals: Goal[];
}

export function FinancialGoals({ goals }: FinancialGoalsProps) {
  return (
    <Card title="Metas Financeiras">
      <div className="space-y-5">
        {goals.map((goal) => {
          const progress = getProgress(goal.currentAmount, goal.targetAmount);
          return (
            <div key={goal.id}>
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-medium text-primary">{goal.name}</p>
                  <p className="text-xs text-muted mt-0.5">{goal.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-accent">{formatPercent(progress)}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              </div>
              <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${goal.name}: ${formatPercent(progress)}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
