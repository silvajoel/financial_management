import type { Account } from '../api/types';
import { formatBRL } from '../utils/format';

const GRADIENTES: Record<string, string> = {
  visa: 'linear-gradient(135deg, #1a1f71, #2a4494)',
  mastercard: 'linear-gradient(135deg, #232526, #414345)',
  elo: 'linear-gradient(135deg, #6a0dad, #b8336a)',
  amex: 'linear-gradient(135deg, #006039, #00875a)',
};

function gradientePorBandeira(bandeira: string | null): string {
  if (!bandeira) return 'linear-gradient(135deg, #334155, #1e293b)';
  const key = bandeira.trim().toLowerCase();
  return GRADIENTES[key] ?? 'linear-gradient(135deg, #334155, #1e293b)';
}

export function CreditCardVisual({ account }: { account: Account }) {
  const disponivel = account.limite !== null ? Number(account.limite) - Number(account.saldo) : null;

  return (
    <div
      style={{
        background: gradientePorBandeira(account.bandeira),
        borderRadius: 14,
        padding: '1.1rem 1.25rem',
        color: '#fff',
        minWidth: 220,
        flex: '1 1 220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 130,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>{account.instituicao}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.9 }}>
          {account.bandeira || '—'}
        </span>
      </div>
      <div style={{ fontSize: '1.05rem', letterSpacing: '0.12em', margin: '0.75rem 0' }}>
        •••• •••• •••• {account.ultimosDigitos || '••••'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', opacity: 0.9 }}>
        <span>{account.nome}</span>
        {disponivel !== null && <span>Disp.: {formatBRL(disponivel)}</span>}
      </div>
    </div>
  );
}
