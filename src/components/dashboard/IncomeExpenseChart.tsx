import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { MonthlyComparison } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';

interface TooltipEntry {
  dataKey?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-raised border border-border rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-secondary mb-2">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="font-medium" style={{ color: entry.color }}>
          {entry.dataKey === 'income' ? 'Receitas' : 'Despesas'}: {formatCurrency(entry.value ?? 0)}
        </p>
      ))}
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />
        Receitas
      </div>
      <div className="flex items-center gap-1.5 text-xs text-secondary">
        <span className="w-2.5 h-2.5 rounded-sm bg-negative inline-block" />
        Despesas
      </div>
    </div>
  );
}

interface IncomeExpenseChartProps {
  data: MonthlyComparison[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <Card title="Receitas x Despesas" action={<ChartLegend />}>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2028" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#8b8fa8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8b8fa8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `R$${(v / 1000).toFixed(0)}k`}
              width={46}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar dataKey="income" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
