import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Account, CardInvoice, CardInvoiceItem, Category } from '../api/types';
import { formatBRL, NOMES_MES } from '../utils/format';

const COMPARTILHADO = 'Compartilhado';

function dataBR(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${dia}/${mes}`;
}

interface Divisao {
  pessoas: string[];
  individuais: Record<string, { itens: CardInvoiceItem[]; total: number }>;
  compartilhados: { itens: CardInvoiceItem[]; total: number };
  foraDivisao: { itens: CardInvoiceItem[]; total: number };
  totalPorPessoa: Record<string, number>;
}

function calcularDivisao(itens: CardInvoiceItem[]): Divisao {
  const individuais: Divisao['individuais'] = {};
  const compartilhados: Divisao['compartilhados'] = { itens: [], total: 0 };
  const foraDivisao: Divisao['foraDivisao'] = { itens: [], total: 0 };

  for (const item of itens) {
    const valor = Number(item.valor);
    if (!item.responsavel || valor < 0) {
      // pagamentos, estornos e itens sem responsável ficam fora da divisão
      foraDivisao.itens.push(item);
      foraDivisao.total += valor;
    } else if (item.responsavel === COMPARTILHADO) {
      compartilhados.itens.push(item);
      compartilhados.total += valor;
    } else {
      (individuais[item.responsavel] ??= { itens: [], total: 0 });
      individuais[item.responsavel].itens.push(item);
      individuais[item.responsavel].total += valor;
    }
  }

  const pessoas = Object.keys(individuais).sort();
  const numPessoas = Math.max(pessoas.length, 1);
  const cotaCompartilhada = compartilhados.total / numPessoas;
  const totalPorPessoa: Record<string, number> = {};
  for (const p of pessoas) {
    totalPorPessoa[p] = individuais[p].total + cotaCompartilhada;
  }

  return { pessoas, individuais, compartilhados, foraDivisao, totalPorPessoa };
}

function gerarTextoWhatsApp(invoice: CardInvoice, divisao: Divisao): string {
  const { pessoas, individuais, compartilhados, totalPorPessoa } = divisao;
  const mesLabel = `${NOMES_MES[invoice.competenciaMes - 1]}/${invoice.competenciaAno}`;
  const linhas: string[] = [`📋 *Divisão da fatura - ${mesLabel}*`, ''];

  for (const pessoa of pessoas) {
    linhas.push(`*${pessoa} (individual)*`, '');
    for (const item of individuais[pessoa].itens) {
      linhas.push(`${dataBR(item.data)}  ${item.descricao.replace(/\s+/g, ' ').trim()}  ${formatBRL(item.valor)}`);
    }
    linhas.push('', `*Total ${pessoa} (individual): ${formatBRL(individuais[pessoa].total)}*`, '', '---', '');
  }

  if (compartilhados.itens.length > 0) {
    const pct = pessoas.length > 0 ? Math.round(100 / pessoas.length) : 100;
    linhas.push(`*${pessoas.join('/')} (${pct}% para cada)*`, '');
    for (const item of compartilhados.itens) {
      linhas.push(`${dataBR(item.data)}  ${item.descricao.replace(/\s+/g, ' ').trim()}  ${formatBRL(item.valor)}`);
    }
    const cota = compartilhados.total / Math.max(pessoas.length, 1);
    linhas.push('', `*Total compartilhado: ${formatBRL(compartilhados.total)}*`, `*Cada um paga: ${formatBRL(cota)}*`, '', '---', '');
  }

  linhas.push('📌 *Total de cada um*', '');
  for (const pessoa of pessoas) {
    linhas.push(`${pessoa}: *${formatBRL(totalPorPessoa[pessoa])}*`);
  }
  linhas.push('', `*Total da fatura: ${formatBRL(invoice.valorTotal)}* ✅`);

  return linhas.join('\n');
}

function InvoiceSplit({ invoice }: { invoice: CardInvoice }) {
  const queryClient = useQueryClient();
  const [novaPessoa, setNovaPessoa] = useState('');
  const [pessoasExtras, setPessoasExtras] = useState<string[]>([]);
  const [copiado, setCopiado] = useState(false);

  const itens = invoice.itens ?? [];
  const divisao = useMemo(() => calcularDivisao(itens), [itens]);

  const opcoesPessoas = useMemo(() => {
    const nomes = new Set<string>();
    for (const item of itens) {
      if (item.responsavel && item.responsavel !== COMPARTILHADO) nomes.add(item.responsavel);
    }
    for (const p of pessoasExtras) nomes.add(p);
    return [...nomes].sort();
  }, [itens, pessoasExtras]);

  const itemMutation = useMutation({
    mutationFn: async ({ id, responsavel }: { id: number; responsavel: string | null }) =>
      api.post(`/invoices/items/${id}/update`, { responsavel }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });

  const cobrarMutation = useMutation({
    mutationFn: async (pessoa: string) => {
      const categoria = categories?.find((c) => c.nome === 'Outras Receitas');
      const conta = accounts?.find((a) => a.tipo === 'debito');
      if (!categoria || !conta) throw new Error('Categoria/conta padrão não encontrada');
      return api.post('/transactions', {
        accountId: conta.id,
        categoryId: categoria.id,
        descricao: `Parte de ${pessoa} - Fatura ${String(invoice.competenciaMes).padStart(2, '0')}/${invoice.competenciaAno}`,
        valorTotal: Number(divisao.totalPorPessoa[pessoa].toFixed(2)),
        status: 'em_aberto',
        competenciaMes: invoice.competenciaMes,
        competenciaAno: invoice.competenciaAno,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });

  async function copiarWhatsApp() {
    await navigator.clipboard.writeText(gerarTextoWhatsApp(invoice, divisao));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button className="btn" onClick={copiarWhatsApp}>
          {copiado ? 'Copiado! ✓' : 'Copiar para WhatsApp'}
        </button>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <input
            placeholder="Adicionar pessoa..."
            value={novaPessoa}
            onChange={(e) => setNovaPessoa(e.target.value)}
            style={{ width: 150 }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              const nome = novaPessoa.trim();
              if (nome && !opcoesPessoas.includes(nome)) setPessoasExtras((p) => [...p, nome]);
              setNovaPessoa('');
            }}
          >
            +
          </button>
        </div>
      </div>

      {divisao.pessoas.length > 0 && (
        <div className="split-summary">
          <table>
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Individual</th>
                <th>Compartilhado</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {divisao.pessoas.map((p) => (
                <tr key={p}>
                  <td>
                    <strong>{p}</strong>
                  </td>
                  <td>{formatBRL(divisao.individuais[p].total)}</td>
                  <td>{formatBRL(divisao.compartilhados.total / divisao.pessoas.length)}</td>
                  <td>
                    <strong>{formatBRL(divisao.totalPorPessoa[p])}</strong>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => cobrarMutation.mutate(p)}
                      disabled={cobrarMutation.isPending}
                      title={`Cria um lançamento "a receber" de ${p} no valor da parte dela(e)`}
                    >
                      Cobrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {divisao.foraDivisao.itens.length > 0 && (
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {divisao.foraDivisao.itens.length} item(ns) fora da divisão (pagamentos/estornos):{' '}
              {formatBRL(divisao.foraDivisao.total)}
            </p>
          )}
        </div>
      )}

      <table style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>De quem?</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr key={item.id}>
              <td>{dataBR(item.data)}</td>
              <td>{item.descricao}</td>
              <td className={Number(item.valor) < 0 ? 'text-success' : undefined}>{formatBRL(item.valor)}</td>
              <td>
                <select
                  value={item.responsavel ?? ''}
                  onChange={(e) => itemMutation.mutate({ id: item.id, responsavel: e.target.value || null })}
                >
                  <option value="">Fora da divisão</option>
                  {opcoesPessoas.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value={COMPARTILHADO}>{COMPARTILHADO} (50/50)</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: CardInvoice }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="card chart-section">
      <div
        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
        onClick={() => setAberto(!aberto)}
      >
        <div>
          <strong>{invoice.Account?.nome}</strong>
          <span className="text-muted" style={{ marginLeft: '0.75rem' }}>
            {NOMES_MES[invoice.competenciaMes - 1]}/{invoice.competenciaAno}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <strong>{formatBRL(invoice.valorTotal)}</strong>
          <span className="text-muted">{aberto ? '▲' : '▼'}</span>
        </div>
      </div>

      {aberto && invoice.itens && <InvoiceSplit invoice={invoice} />}
    </div>
  );
}

export function CardInvoices() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => (await api.get<CardInvoice[]>('/invoices')).data,
  });

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Faturas de Cartão</h2>
      <p className="text-muted" style={{ marginTop: -8 }}>
        Clique numa fatura para ver os itens, dividir os gastos por pessoa e copiar o resumo para o WhatsApp.
      </p>
      {isLoading && <p className="text-muted">Carregando...</p>}
      {invoices?.length === 0 && <p className="text-muted">Nenhuma fatura importada ainda. Use "Importar Fatura".</p>}
      {invoices?.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
