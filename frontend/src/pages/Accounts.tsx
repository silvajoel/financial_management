import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Account, Instituicao, TipoConta } from '../api/types';
import { formatBRL } from '../utils/format';

const NOMES_INSTITUICAO: Record<Instituicao, string> = {
  banco_do_brasil: 'Banco do Brasil',
  mercado_pago: 'Mercado Pago',
  sicoob: 'Sicoob',
  nubank: 'Nubank',
};

const NOMES_TIPO: Record<TipoConta, string> = {
  credito: 'Crédito',
  debito: 'Débito',
  investimento: 'Investimento',
  emprestimo: 'Empréstimo',
};

function EditableAccountRow({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const [saldo, setSaldo] = useState(String(account.saldo));
  const [limite, setLimite] = useState(account.limite !== null ? String(account.limite) : '');

  const mutation = useMutation({
    mutationFn: async () =>
      api.put(`/accounts/${account.id}`, {
        saldo: Number(saldo),
        limite: limite === '' ? null : Number(limite),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setEditando(false);
    },
  });

  if (!editando) {
    return (
      <tr>
        <td>{account.nome}</td>
        <td>{NOMES_TIPO[account.tipo]}</td>
        <td>{formatBRL(account.saldo)}</td>
        <td>{account.limite !== null ? formatBRL(account.limite) : '—'}</td>
        <td>
          <button className="btn btn-secondary" onClick={() => setEditando(true)}>
            Editar
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{account.nome}</td>
      <td>{NOMES_TIPO[account.tipo]}</td>
      <td>
        <input value={saldo} onChange={(e) => setSaldo(e.target.value)} style={{ width: 110 }} />
      </td>
      <td>
        <input value={limite} onChange={(e) => setLimite(e.target.value)} style={{ width: 110 }} placeholder="—" />
      </td>
      <td style={{ display: 'flex', gap: '0.4rem' }}>
        <button className="btn" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Salvar
        </button>
        <button className="btn btn-secondary" onClick={() => setEditando(false)}>
          Cancelar
        </button>
      </td>
    </tr>
  );
}

export function Accounts() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });

  if (isLoading) return <p className="text-muted">Carregando...</p>;

  const grupos = Object.entries(
    (accounts ?? []).reduce<Record<string, Account[]>>((acc, conta) => {
      (acc[conta.instituicao] ??= []).push(conta);
      return acc;
    }, {}),
  );

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Contas</h2>
      {grupos.map(([instituicao, contas]) => (
        <div key={instituicao} className="card chart-section">
          <h3>{NOMES_INSTITUICAO[instituicao as Instituicao]}</h3>
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                <th>Tipo</th>
                <th>Saldo</th>
                <th>Limite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contas.map((c) => (
                <EditableAccountRow key={c.id} account={c} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
