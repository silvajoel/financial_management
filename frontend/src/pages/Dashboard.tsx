import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Account, Goal, Transaction, TransactionSummary } from '../api/types';
import { StatTile } from '../components/StatTile';
import { Meter } from '../components/Meter';
import { CreditCardVisual } from '../components/CreditCardVisual';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { SaldoTrendChart } from '../components/charts/SaldoTrendChart';
import { formatBRL, NOMES_MES } from '../utils/format';

function ultimosMeses(qtd: number) {
  const hoje = new Date();
  const meses: { mes: number; ano: number }[] = [];
  for (let i = qtd - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({ mes: d.getMonth() + 1, ano: d.getFullYear() });
  }
  return meses;
}

export function Dashboard() {
  const hoje = new Date();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();

  const { data: summary, isLoading: carregandoSummary } = useQuery({
    queryKey: ['summary', mes, ano],
    queryFn: async () => (await api.get<TransactionSummary>('/transactions/summary', { params: { mes, ano } })).data,
  });

  const { data: trend } = useQuery({
    queryKey: ['summary-trend'],
    queryFn: async () => {
      const meses = ultimosMeses(6);
      const resultados = await Promise.all(
        meses.map((m) => api.get<TransactionSummary>('/transactions/summary', { params: m })),
      );
      return meses.map((m, i) => ({
        label: `${NOMES_MES[m.mes - 1]}/${String(m.ano).slice(2)}`,
        saldo: resultados[i].data.saldo,
      }));
    },
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => (await api.get<Goal[]>('/goals')).data,
  });

  const { data: transacoesMes } = useQuery({
    queryKey: ['transactions', mes, ano],
    queryFn: async () => (await api.get<Transaction[]>('/transactions', { params: { mes, ano } })).data,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });

  const cartoes = (accounts ?? []).filter((a) => a.tipo === 'credito');
  const parcelasAtivas = (transacoesMes ?? []).filter((t) => t.parcelaTotal && t.parcelaAtual);

  // Previsão do próximo mês: recorrências + parcelas que ainda vão avançar,
  // com o valor atual como estimativa.
  const previsao = (transacoesMes ?? []).filter((t) => {
    const parcelaEmAndamento = t.parcelaTotal !== null && t.parcelaAtual !== null && t.parcelaAtual < t.parcelaTotal;
    return t.recorrente || parcelaEmAndamento;
  });
  const previsaoSaidas = previsao.filter((t) => t.Category?.tipo === 'despesa' || t.Category?.tipo === 'investimento');
  const previsaoEntradas = previsao.filter((t) => t.Category?.tipo === 'receita');
  const totalPrevistoSaidas = previsaoSaidas.reduce((acc, t) => acc + Number(t.valorTotal), 0);
  const totalPrevistoEntradas = previsaoEntradas.reduce((acc, t) => acc + Number(t.valorTotal), 0);
  const proximoMes = mes === 12 ? 1 : mes + 1;

  if (carregandoSummary) return <p className="text-muted">Carregando...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p className="text-muted" style={{ marginTop: -8 }}>
        {NOMES_MES[mes - 1]}/{ano}
      </p>

      <div className="stat-grid">
        <StatTile label="Receita do mês" value={formatBRL(summary?.receitaTotal ?? 0)} tone="good" />
        <StatTile label="Despesas do mês" value={formatBRL(summary?.despesaTotal ?? 0)} tone="bad" />
        <StatTile label="Investimentos do mês" value={formatBRL(summary?.investimentoTotal ?? 0)} />
        <StatTile
          label="Saldo do mês"
          value={formatBRL(summary?.saldo ?? 0)}
          tone={(summary?.saldo ?? 0) >= 0 ? 'good' : 'bad'}
        />
      </div>

      {cartoes.length > 0 && (
        <div className="chart-section">
          <h3>Cartões de crédito</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {cartoes.map((c) => (
              <CreditCardVisual key={c.id} account={c} />
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div>
          <div className="card chart-section">
            <h3>Saldo — últimos 6 meses</h3>
            {trend && <SaldoTrendChart dados={trend} />}
          </div>

          <div className="card chart-section">
            <h3>Despesas por categoria</h3>
            <CategoryBarChart dados={summary?.porCategoria.map((c) => ({ nome: c.nome, total: c.total })) ?? []} />
          </div>
        </div>

        <div>
          {goals && goals.length > 0 && (
            <div className="card chart-section">
              <h3>Metas financeiras</h3>
              {goals.map((g) => (
                <Meter key={g.id} label={g.nome} atual={g.valorAtual} alvo={g.valorAlvo} formatoValor={formatBRL} />
              ))}
            </div>
          )}

          {parcelasAtivas.length > 0 && (
            <div className="card chart-section">
              <h3>Parcelas e empréstimos</h3>
              {parcelasAtivas.map((t) => (
                <Meter
                  key={t.id}
                  label={t.descricao}
                  atual={t.parcelaAtual ?? 0}
                  alvo={t.parcelaTotal ?? 0}
                  formatoValor={(v) => `${v}x`}
                />
              ))}
            </div>
          )}

          {previsao.length > 0 && (
            <div className="card chart-section">
              <h3>Previsão de {NOMES_MES[proximoMes - 1]}</h3>
              {previsaoSaidas.map((t) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                  <span>
                    {t.descricao}
                    {t.parcelaAtual && t.parcelaTotal && (
                      <span className="text-muted"> ({t.parcelaAtual + 1}/{t.parcelaTotal})</span>
                    )}
                  </span>
                  <span>{formatBRL(t.valorTotal)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                <span>Saídas previstas</span>
                <span className="text-danger">{formatBRL(totalPrevistoSaidas)}</span>
              </div>
              {previsaoEntradas.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Entradas previstas</span>
                  <span className="text-success">{formatBRL(totalPrevistoEntradas)}</span>
                </div>
              )}
              <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 0 }}>
                Estimativa com os valores deste mês; parcelas avançam automaticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
