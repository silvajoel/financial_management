interface StatTileProps {
  label: string;
  value: string;
  tone?: 'good' | 'bad' | 'neutral';
}

export function StatTile({ label, value, tone = 'neutral' }: StatTileProps) {
  const color = tone === 'good' ? 'var(--viz-good)' : tone === 'bad' ? 'var(--viz-bad)' : undefined;

  return (
    <div className="card">
      <p className="stat-tile-label">{label}</p>
      <p className="stat-tile-value" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
