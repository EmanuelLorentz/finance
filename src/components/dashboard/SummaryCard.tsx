import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/format';

type CardVariant = 'default' | 'income' | 'expense' | 'savings';

const ICON_CLASSES: Record<CardVariant, string> = {
  default: 'text-secondary bg-surface-raised',
  income: 'text-accent bg-accent/10',
  expense: 'text-negative bg-negative/10',
  savings: 'text-blue-400 bg-blue-500/10',
};

interface SummaryCardProps {
  title: string;
  value: number;
  changePercent: number;
  icon: LucideIcon;
  variant?: CardVariant;
}

export function SummaryCard({
  title,
  value,
  changePercent,
  icon: Icon,
  variant = 'default',
}: SummaryCardProps) {
  const isPositive = changePercent >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendClass = isPositive ? 'text-accent' : 'text-negative';

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ${ICON_CLASSES[variant]}`}
        >
          <Icon size={17} strokeWidth={1.75} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendClass}`}>
          <TrendIcon size={12} />
          <span>{formatPercent(Math.abs(changePercent))}</span>
        </div>
      </div>
      <p className="text-xs text-secondary mb-1">{title}</p>
      <p className="text-lg font-semibold text-primary">{formatCurrency(value)}</p>
    </div>
  );
}
