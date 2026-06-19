import { Calendar, TrendingUp, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ProjectStats } from '../../utils/projectUtils';
import { formatCurrency, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';

const COMPLETION_CONFIG = {
  on_track: { label: 'No prazo', icon: CheckCircle, className: 'text-accent' },
  at_risk: { label: 'Em risco', icon: AlertTriangle, className: 'text-amber-400' },
  over_budget: { label: 'Acima do orçamento', icon: AlertTriangle, className: 'text-negative' },
  no_budget: { label: 'Sem orçamento definido', icon: Info, className: 'text-secondary' },
} as const;

interface ProjectIndicatorsProps {
  stats: ProjectStats;
}

export function ProjectIndicators({ stats }: ProjectIndicatorsProps) {
  const completion = COMPLETION_CONFIG[stats.estimatedCompletion];
  const CompletionIcon = completion.icon;

  const indicators = [
    {
      id: 'monthly_avg',
      label: 'Média mensal de gastos',
      value: formatCurrency(stats.monthlyAverage),
      icon: TrendingUp,
      className: 'text-secondary',
    },
    ...(stats.daysRemaining !== undefined
      ? [
          {
            id: 'days_remaining',
            label: 'Dias restantes',
            value:
              stats.daysRemaining <= 0
                ? 'Prazo encerrado'
                : `${stats.daysRemaining} dias`,
            icon: Calendar,
            className: stats.daysRemaining <= 30 ? 'text-amber-400' : 'text-secondary',
          },
        ]
      : []),
    ...(stats.progressPercent !== undefined
      ? [
          {
            id: 'budget_used',
            label: 'Orçamento consumido',
            value: formatPercent(stats.progressPercent),
            icon: Clock,
            className: stats.progressPercent > 100 ? 'text-negative' : 'text-secondary',
          },
        ]
      : []),
    {
      id: 'completion',
      label: 'Estimativa de conclusão',
      value: completion.label,
      icon: CompletionIcon,
      className: completion.className,
    },
    ...(stats.totalIncome > 0
      ? [
          {
            id: 'income',
            label: 'Total de entradas',
            value: formatCurrency(stats.totalIncome),
            icon: TrendingUp,
            className: 'text-accent',
          },
        ]
      : []),
  ];

  return (
    <Card title="Indicadores">
      <div>
        {indicators.map((indicator) => {
          const IndicatorIcon = indicator.icon;
          return (
            <div
              key={indicator.id}
              className="flex items-center justify-between py-3.5 border-b border-border last:border-0"
            >
              <p className="text-sm text-secondary">{indicator.label}</p>
              <div className={`flex items-center gap-1.5 shrink-0 ml-3 ${indicator.className}`}>
                <IndicatorIcon size={13} />
                <span className="text-sm font-semibold">{indicator.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
