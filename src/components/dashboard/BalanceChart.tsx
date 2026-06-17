import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { BalanceHistoryEntry } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';

interface TooltipEntry {
  value?: number;
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
      <p className="text-secondary mb-1">{label}</p>
      <p className="text-primary font-medium">{formatCurrency(payload[0].value ?? 0)}</p>
    </div>
  );
}

interface BalanceChartProps {
  data: BalanceHistoryEntry[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  return (
    <Card title="Evolução do Saldo">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ fill: '#4ade80', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#4ade80', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
