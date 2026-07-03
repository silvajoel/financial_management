import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatBRL, formatCompactBRL } from '../../utils/format';

interface CategoryBarChartProps {
  dados: { nome: string; total: number }[];
}

export function CategoryBarChart({ dados }: CategoryBarChartProps) {
  const ordenado = [...dados].sort((a, b) => b.total - a.total);
  const altura = Math.max(120, ordenado.length * 34);

  if (ordenado.length === 0) {
    return <p className="text-muted">Sem despesas categorizadas neste mês.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={ordenado} layout="vertical" margin={{ left: 8, right: 48 }}>
        <CartesianGrid horizontal={false} stroke="var(--viz-grid)" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="nome"
          width={130}
          tickLine={false}
          axisLine={{ stroke: 'var(--viz-baseline)' }}
          tick={{ fill: 'var(--viz-ink-secondary)', fontSize: 12.5 }}
        />
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
        <Bar dataKey="total" fill="var(--viz-seq-fill)" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value: unknown) => formatCompactBRL(Number(value))}
            fill="var(--viz-ink-secondary)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
