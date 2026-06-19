import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { ProjectEvolutionEntry } from '../../utils/projectUtils';
import { formatCurrency } from '../../utils/format';
import { Card } from '../ui/Card';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
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

interface ProjectEvolutionChartProps {
  data: ProjectEvolutionEntry[];
  projectColor: string;
}

export function ProjectEvolutionChart({ data, projectColor }: ProjectEvolutionChartProps) {
  const budget = data[0]?.budget;

  return (
    <Card title="Evolução dos Gastos">
      {data.length === 0 ? (
        <div className="h-52 flex items-center justify-center">
          <p className="text-sm text-muted">Nenhuma transação registrada ainda.</p>
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="projectGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={projectColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={projectColor} stopOpacity={0} />
                </linearGradient>
              </defs>
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
              {budget !== undefined && (
                <ReferenceLine
                  y={budget}
                  stroke="#555870"
                  strokeDasharray="4 4"
                  label={{ value: 'Orçamento', fill: '#555870', fontSize: 11, position: 'insideTopRight' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={projectColor}
                strokeWidth={2}
                fill="url(#projectGradient)"
                dot={{ fill: projectColor, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: projectColor, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
