import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { FinancialIndicator } from '../../types/dashboard';
import { Card } from '../ui/Card';

const TREND_CONFIG = {
  positive: { icon: TrendingUp, className: 'text-accent' },
  negative: { icon: TrendingDown, className: 'text-negative' },
  neutral: { icon: Minus, className: 'text-secondary' },
} as const;

interface FinancialIndicatorsProps {
  indicators: FinancialIndicator[];
}

export function FinancialIndicators({ indicators }: FinancialIndicatorsProps) {
  return (
    <Card title="Indicadores Financeiros">
      <div className="space-y-0">
        {indicators.map((indicator) => {
          const { icon: TrendIcon, className } = TREND_CONFIG[indicator.trend];
          return (
            <div
              key={indicator.id}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
            >
              <div className="min-w-0 mr-3">
                <p className="text-sm font-medium text-secondary">{indicator.label}</p>
                <p className="text-xs text-muted mt-0.5">{indicator.description}</p>
              </div>
              <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
                <TrendIcon size={13} />
                <span className="text-sm font-semibold">{indicator.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
