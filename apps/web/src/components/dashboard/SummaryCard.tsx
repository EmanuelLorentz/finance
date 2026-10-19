import { Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/format';

type CardVariant = 'default' | 'income' | 'expense' | 'savings';
type Reading = 'higher-is-better' | 'lower-is-better' | 'share';
type Tone = 'positive' | 'negative' | 'flat';

const ICON_CLASSES: Record<CardVariant, string> = {
  default: 'text-secondary bg-surface-raised',
  income: 'text-accent bg-accent/10',
  expense: 'text-negative bg-negative/10',
  savings: 'text-blue-400 bg-blue-500/10',
};

const TONE_CLASSES: Record<Tone, string> = {
  positive: 'text-accent',
  negative: 'text-negative',
  flat: 'text-secondary',
};

interface SummaryCardProps {
  title: string;
  value: number;
  changePercent: number | null;
  icon: LucideIcon;
  variant?: CardVariant;
  reading?: Reading;
}

function toneOf(changePercent: number, reading: Reading): Tone {
  if (reading === 'share') {
    if (changePercent > 0) return 'positive';
    if (changePercent < 0) return 'negative';
    return 'flat';
  }

  if (changePercent === 0) return 'flat';
  const improved = reading === 'lower-is-better' ? changePercent < 0 : changePercent > 0;
  return improved ? 'positive' : 'negative';
}

export function SummaryCard({
  title,
  value,
  changePercent,
  icon: Icon,
  variant = 'default',
  reading = 'higher-is-better',
}: SummaryCardProps) {
  const tone = changePercent === null ? null : toneOf(changePercent, reading);
  const TrendIcon = changePercent === null || changePercent === 0
    ? Minus
    : changePercent > 0
      ? TrendingUp
      : TrendingDown;
  const shownPercent = changePercent === null
    ? null
    : reading === 'share'
      ? formatPercent(changePercent)
      : formatPercent(Math.abs(changePercent));

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`flex items-center justify-center w-9 h-9 rounded-lg ${ICON_CLASSES[variant]}`}
        >
          <Icon size={17} strokeWidth={1.75} />
        </div>
        {tone && shownPercent && (
          <div className={`flex items-center gap-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
            {reading !== 'share' && <TrendIcon size={12} />}
            <span>{shownPercent}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-secondary mb-1">{title}</p>
      <p className={`text-lg font-semibold ${value < 0 ? 'text-negative' : 'text-primary'}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
