interface MeterProps {
  label: string;
  atual: number;
  alvo: number;
  formatoValor?: (v: number) => string;
}

export function Meter({ label, atual, alvo, formatoValor = String }: MeterProps) {
  const pct = alvo > 0 ? Math.min(100, Math.max(0, (atual / alvo) * 100)) : 0;

  return (
    <div className="meter">
      <div className="meter-header">
        <span>{label}</span>
        <span className="text-muted">
          {formatoValor(atual)} / {formatoValor(alvo)}
        </span>
      </div>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
