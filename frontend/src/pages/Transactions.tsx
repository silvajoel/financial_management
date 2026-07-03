import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Account, Category, StatusTransacao, Transaction } from '../api/types';
import { formatBRL, NOMES_MES } from '../utils/format';

const STATUS_LABEL: Record<StatusTransacao, string> = {
  pago: 'Pago',
  parcial: 'Parcial',
  em_aberto: 'Em aberto',
  liquidado: 'Liquidado',
};

function novoLancamentoInicial(mes: number, ano: number) {
  return {
    accountId: '',
    categoryId: '',
    descricao: '',
    valorTotal: '',
    competenciaMes: mes,
    competenciaAno: ano,
    dataVencimento: '',
    status: 'em_aberto' as StatusTransacao,
  };
}

function novaTransferenciaInicial() {
  return { contaOrigemId: '', contaDestinoId: '', valor: '', data: new Date().toISOString().slice(0, 10), descricao: '' };
}

function TransferForm({ accounts, onDone }: { accounts: Account[] | undefined; onDone: () => void }) {
  const [form, setForm] = useState(novaTransferenciaInicial());

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/transactions/transfer', {
        contaOrigemId: Number(form.contaOrigemId),
        contaDestinoId: Number(form.contaDestinoId),
        valor: Number(form.valor),
        data: form.data,
        descricao: form.descricao || undefined,
      }),
    onSuccess: () => {
      setForm(novaTransferenciaInicial());
      onDone();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.contaOrigemId || !form.contaDestinoId || !form.valor) return;
    mutation.mutate();
  }

  return (
    <form className="card chart-section" onSubmit={handleSubmit}>
      <h3>Transferir entre contas</h3>
      <div className="form-grid">
        <div className="form-field">
          <label>De</label>
          <select value={form.contaOrigemId} onChange={(e) => setForm({ ...form, contaOrigemId: e.target.value })} required>
            <option value="">Selecione</option>
            {accounts?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Para</label>
          <select value={form.contaDestinoId} onChange={(e) => setForm({ ...form, contaDestinoId: e.target.value })} required>
            <option value="">Selecione</option>
            {accounts?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Valor</label>
          <input
            type="number"
            step="0.01"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            required
          />
        </div>
        <div className="form-field">
          <label>Data</label>
          <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
        </div>
        <div className="form-field">
          <label>Descrição (opcional)</label>
          <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
        </div>
      </div>
      <button className="btn" type="submit" style={{ marginTop: '0.75rem' }} disabled={mutation.isPending}>
        Transferir
      </button>
      {mutation.isError && <p className="text-danger">Não foi possível transferir. Confira as contas selecionadas.</p>}
    </form>
  );
}

export function Transactions() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [form, setForm] = useState(novoLancamentoInicial(mes, ano));
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions', mes, ano],
    queryFn: async () => (await api.get<Transaction[]>('/transactions', { params: { mes, ano } })).data,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/transactions', {
        ...form,
        accountId: Number(form.accountId),
        categoryId: Number(form.categoryId),
        valorTotal: Number(form.valorTotal),
        dataVencimento: form.dataVencimento || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', mes, ano] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setForm(novoLancamentoInicial(mes, ano));
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: StatusTransacao }) =>
      api.post(`/transactions/${id}/update`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', mes, ano] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.post(`/transactions/${id}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', mes, ano] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.accountId || !form.categoryId || !form.descricao || !form.valorTotal) return;
    createMutation.mutate();
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Lançamentos</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}>
          {NOMES_MES.map((nome, i) => (
            <option key={nome} value={i + 1}>
              {nome}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          style={{ width: 90 }}
        />
      </div>

      <form className="card chart-section" onSubmit={handleSubmit}>
        <h3>Novo lançamento</h3>
        <div className="form-grid">
          <div className="form-field">
            <label>Conta</label>
            <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} required>
              <option value="">Selecione</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Categoria</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Selecione</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Descrição</label>
            <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
          </div>
          <div className="form-field">
            <label>Valor</label>
            <input
              type="number"
              step="0.01"
              value={form.valorTotal}
              onChange={(e) => setForm({ ...form, valorTotal: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label>Vencimento</label>
            <input
              type="date"
              value={form.dataVencimento}
              onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusTransacao })}>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn" type="submit" style={{ marginTop: '0.75rem' }} disabled={createMutation.isPending}>
          Adicionar
        </button>
      </form>

      <TransferForm
        accounts={accounts}
        onDone={() => {
          queryClient.invalidateQueries({ queryKey: ['transactions', mes, ano] });
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }}
      />

      <div className="card">
        {isLoading ? (
          <p className="text-muted">Carregando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Conta</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((t) => (
                <tr key={t.id}>
                  <td>{t.descricao}</td>
                  <td>{t.Account?.nome}</td>
                  <td>{t.Category?.nome}</td>
                  <td>{formatBRL(t.valorTotal)}</td>
                  <td>
                    <select
                      value={t.status}
                      onChange={(e) => statusMutation.mutate({ id: t.id, status: e.target.value as StatusTransacao })}
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-secondary" onClick={() => deleteMutation.mutate(t.id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {transactions?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">
                    Nenhum lançamento neste mês.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
