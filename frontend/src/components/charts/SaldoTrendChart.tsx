import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatBRL, formatCompactBRL } from '../../utils/format';

interface SaldoTrendChartProps {
  dados: { label: string; saldo: number }[];
}

function EndLabel(props: any) {
  const { x, y, index, value, dados } = props;
  if (index !== dados.length - 1) return null;
  return (
    <text x={x} y={y} dy={-10} textAnchor="middle" fill="var(--viz-ink-primary)" fontSize={12.5} fontWeight={600}>
      {formatCompactBRL(value)}
    </text>
  );
}

export function SaldoTrendChart({ dados }: SaldoTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={dados} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: 'var(--viz-baseline)' }}
          tick={{ fill: 'var(--viz-ink-muted)', fontSize: 12 }}
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => formatBRL(Number(value))}
          contentStyle={{
            background: 'var(--viz-surface)',
            border: '1px solid var(--viz-grid)',
            borderRadius: 8,
            color: 'var(--viz-ink-primary)',
            fontSize: 13,
          }}
        />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="var(--viz-seq-fill)"
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2, stroke: 'var(--viz-surface)', fill: 'var(--viz-seq-fill)' }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--viz-surface)' }}
          label={(props: any) => <EndLabel {...props} dados={dados} />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
