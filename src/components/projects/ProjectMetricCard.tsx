import type { LucideIcon } from 'lucide-react';

type MetricVariant = 'default' | 'income' | 'expense' | 'warning';

const ICON_CLASSES: Record<MetricVariant, string> = {
  default: 'text-secondary bg-surface-raised',
  income: 'text-accent bg-accent/10',
  expense: 'text-negative bg-negative/10',
  warning: 'text-amber-400 bg-amber-400/10',
};

interface ProjectMetricCardProps {
  title: string;
  displayValue: string;
  icon: LucideIcon;
  variant?: MetricVariant;
  subtitle?: string;
}

export function ProjectMetricCard({
  title,
  displayValue,
  icon: Icon,
  variant = 'default',
  subtitle,
}: ProjectMetricCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${ICON_CLASSES[variant]}`}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-xs text-secondary mb-1">{title}</p>
      <p className="text-lg font-semibold text-primary">{displayValue}</p>
      {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
    </div>
  );
}
