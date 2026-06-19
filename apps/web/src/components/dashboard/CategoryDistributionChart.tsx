import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategoryExpense } from '@finance/shared';
import { formatCurrency, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';

interface TooltipEntry {
  payload?: CategoryExpense;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload as CategoryExpense;
  return (
    <div className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-primary font-medium mb-0.5">{entry.category}</p>
      <p className="text-secondary">{formatCurrency(entry.amount)}</p>
      <p className="text-muted text-xs">{formatPercent(entry.percentage)}</p>
    </div>
  );
}

interface CategoryDistributionChartProps {
  data: CategoryExpense[];
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  return (
    <Card title="Gastos por Categoria">
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={68}
              paddingAngle={2}
              dataKey="amount"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.slice(0, 5).map((entry) => (
          <div key={entry.category} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-secondary truncate">{entry.category}</span>
            </div>
            <span className="text-xs text-muted ml-2 shrink-0">{formatPercent(entry.percentage)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
