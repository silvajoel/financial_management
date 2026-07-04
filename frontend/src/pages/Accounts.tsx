import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Account, TipoConta } from '../api/types';
import { formatBRL } from '../utils/format';

const NOMES_TIPO: Record<TipoConta, string> = {
  credito: 'Crédito',
  conta_corrente: 'Conta Corrente',
  investimento: 'Investimento',
  emprestimo: 'Empréstimo',
};

const INSTITUICOES_CONHECIDAS = ['Banco do Brasil', 'Mercado Pago', 'Sicoob', 'Nubank'];

const BANDEIRAS = ['Visa', 'Mastercard', 'Elo', 'Amex'];

function EditableAccountRow({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: account.nome,
    instituicao: account.instituicao,
    tipo: account.tipo,
    saldo: String(account.saldo),
    limite: account.limite !== null ? String(account.limite) : '',
    bandeira: account.bandeira ?? '',
    ultimosDigitos: account.ultimosDigitos ?? '',
  });

  const mutation = useMutation({
    mutationFn: async () =>
      api.post(`/accounts/${account.id}/update`, {
        nome: form.nome,
        instituicao: form.instituicao,
        tipo: form.tipo,
        saldo: Number(form.saldo),
        limite: form.limite === '' ? null : Number(form.limite),
        bandeira: form.bandeira || null,
        ultimosDigitos: form.ultimosDigitos || null,
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
      <td colSpan={5} style={{ background: 'var(--bg)' }}>
        <div className="form-grid" style={{ padding: '0.5rem 0' }}>
          <div className="form-field">
            <label>Instituição</label>
            <input
              list="instituicoes-conhecidas"
              value={form.instituicao}
              onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Apelido</label>
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="form-field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoConta })}>
              {Object.entries(NOMES_TIPO).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Saldo</label>
            <input value={form.saldo} onChange={(e) => setForm({ ...form, saldo: e.target.value })} style={{ width: 110 }} />
          </div>
          {form.tipo === 'credito' && (
            <div className="form-field">
              <label>Limite disponível</label>
              <input
                value={form.limite}
                onChange={(e) => setForm({ ...form, limite: e.target.value })}
                style={{ width: 110 }}
                placeholder="—"
              />
            </div>
          )}
          {(form.tipo === 'credito' || form.tipo === 'conta_corrente') && (
            <>
              <div className="form-field">
                <label>Bandeira</label>
                <input
                  list="bandeiras-conhecidas"
                  value={form.bandeira}
                  onChange={(e) => setForm({ ...form, bandeira: e.target.value })}
                  placeholder="Ex.: Visa, Mastercard, Elo..."
                />
              </div>
              <div className="form-field">
                <label>Últimos 4 dígitos</label>
                <input
                  value={form.ultimosDigitos}
                  onChange={(e) => setForm({ ...form, ultimosDigitos: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="0000"
                  maxLength={4}
                  style={{ width: 80 }}
                />
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Salvar
          </button>
          <button className="btn btn-secondary" onClick={() => setEditando(false)}>
            Cancelar
          </button>
        </div>
      </td>
    </tr>
  );
}

function novaContaInicial() {
  return { nome: '', instituicao: '', tipo: 'conta_corrente' as TipoConta, saldo: '', limite: '', bandeira: '', ultimosDigitos: '' };
}

function NovaContaForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(novaContaInicial());

  const mutation = useMutation({
    mutationFn: async () =>
      api.post('/accounts', {
        nome: form.nome || `${form.instituicao} - ${NOMES_TIPO[form.tipo]}`,
        instituicao: form.instituicao,
        tipo: form.tipo,
        saldo: form.saldo === '' ? 0 : Number(form.saldo),
        limite: form.limite === '' ? null : Number(form.limite),
        bandeira: form.bandeira || null,
        ultimosDigitos: form.ultimosDigitos || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setForm(novaContaInicial());
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.instituicao) return;
    mutation.mutate();
  }

  return (
    <details className="collapsible">
      <summary>Nova conta ou cartão</summary>
      <form className="collapsible-body" onSubmit={handleSubmit}>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>
          Serve para banco, cartão de crédito ou algo genérico como "Boleto" e "Dinheiro". Contas de água/luz não
          entram aqui — elas são lançamentos mensais, na tela Lançamentos.
        </p>
        <div className="form-grid">
        <div className="form-field">
          <label>Instituição</label>
          <input
            list="instituicoes-conhecidas"
            value={form.instituicao}
            onChange={(e) => setForm({ ...form, instituicao: e.target.value })}
            placeholder="Ex.: Banco do Brasil, Caixa, Inter..."
            required
          />
          <datalist id="instituicoes-conhecidas">
            {INSTITUICOES_CONHECIDAS.map((nome) => (
              <option key={nome} value={nome} />
            ))}
          </datalist>
        </div>
        <div className="form-field">
          <label>Apelido (opcional)</label>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Se vazio, gera automático"
          />
        </div>
        <div className="form-field">
          <label>Tipo</label>
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoConta })}>
            {Object.entries(NOMES_TIPO).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Saldo inicial</label>
          <input value={form.saldo} onChange={(e) => setForm({ ...form, saldo: e.target.value })} placeholder="0,00" />
        </div>
        {form.tipo === 'credito' && (
          <div className="form-field">
            <label>Limite disponível</label>
            <input
              value={form.limite}
              onChange={(e) => setForm({ ...form, limite: e.target.value })}
              placeholder="Ex.: 10000"
            />
          </div>
        )}
        {(form.tipo === 'credito' || form.tipo === 'conta_corrente') && (
          <>
            <div className="form-field">
              <label>Bandeira</label>
              <input
                list="bandeiras-conhecidas"
                value={form.bandeira}
                onChange={(e) => setForm({ ...form, bandeira: e.target.value })}
                placeholder="Ex.: Visa, Mastercard, Elo..."
              />
              <datalist id="bandeiras-conhecidas">
                {BANDEIRAS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="form-field">
              <label>Últimos 4 dígitos</label>
              <input
                value={form.ultimosDigitos}
                onChange={(e) => setForm({ ...form, ultimosDigitos: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="0000"
                maxLength={4}
                style={{ width: 80 }}
              />
            </div>
          </>
        )}
      </div>
        <button className="btn" type="submit" style={{ marginTop: '0.75rem' }} disabled={mutation.isPending}>
          Adicionar conta
        </button>
      </form>
    </details>
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

      <NovaContaForm />

      {grupos.map(([instituicao, contas]) => (
        <div key={instituicao} className="card chart-section">
          <h3>{instituicao}</h3>
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
