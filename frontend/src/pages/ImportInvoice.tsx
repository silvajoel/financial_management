import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Account, Category } from '../api/types';
import { formatBRL } from '../utils/format';

interface PreviewItem {
  data: string | null;
  descricao: string;
  pais: string | null;
  valor: number;
  portador: string | null;
  secaoBB: string | null;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
  categoryId: number | null;
  categoryNome: string | null;
}

interface PreviewResponse {
  accountId: number;
  valorTotalFatura: number | null;
  saldoFaturaAnterior: number | null;
  dataVencimento: string | null;
  dataFechamento: string | null;
  somaItens: number;
  itens: PreviewItem[];
}

export function ImportInvoice() {
  const [accountId, setAccountId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [itensEditados, setItensEditados] = useState<PreviewItem[]>([]);
  const [valorTotal, setValorTotal] = useState('');
  const [competenciaMes, setCompetenciaMes] = useState('');
  const [competenciaAno, setCompetenciaAno] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get<Account[]>('/accounts')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const previewMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('accountId', accountId);
      formData.append('arquivo', arquivo as File);
      return (await api.post<PreviewResponse>('/invoices/preview', formData)).data;
    },
    onSuccess: (data) => {
      setPreview(data);
      setItensEditados(data.itens);
      setValorTotal(String(data.valorTotalFatura ?? data.somaItens));
      if (data.dataVencimento) {
        const [ano, mes] = data.dataVencimento.split('-');
        setCompetenciaAno(ano);
        setCompetenciaMes(String(Number(mes)));
      } else {
        const hoje = new Date();
        setCompetenciaAno(String(hoje.getFullYear()));
        setCompetenciaMes(String(hoje.getMonth() + 1));
      }
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () =>
      api.post('/invoices/confirm', {
        accountId: Number(accountId),
        competenciaMes: Number(competenciaMes),
        competenciaAno: Number(competenciaAno),
        dataFechamento: preview?.dataFechamento ?? null,
        dataVencimento: preview?.dataVencimento ?? null,
        valorTotal: Number(valorTotal),
        itens: itensEditados,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      navigate('/faturas');
    },
  });

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setArquivo(e.target.files?.[0] ?? null);
  }

  function handleAnalisar(e: FormEvent) {
    e.preventDefault();
    if (!accountId || !arquivo) return;
    previewMutation.mutate();
  }

  function atualizarItem(index: number, campo: keyof PreviewItem, valor: string) {
    setItensEditados((itens) =>
      itens.map((item, i) =>
        i === index
          ? { ...item, [campo]: campo === 'categoryId' ? Number(valor) : campo === 'valor' ? Number(valor) : valor }
          : item,
      ),
    );
  }

  function removerItem(index: number) {
    setItensEditados((itens) => itens.filter((_, i) => i !== index));
  }

  const somaEditada = itensEditados.reduce((acc, i) => acc + Number(i.valor), 0);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Importar Fatura</h2>

      {!preview && (
        <form className="card" onSubmit={handleAnalisar}>
          <div className="form-grid">
            <div className="form-field">
              <label>Cartão</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="">Selecione</option>
                {accounts
                  ?.filter((a) => a.tipo === 'credito')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-field">
              <label>Arquivo (PDF ou CSV)</label>
              <input type="file" accept=".pdf,.csv" onChange={handleFileChange} required />
            </div>
          </div>
          <button className="btn" type="submit" style={{ marginTop: '1rem' }} disabled={previewMutation.isPending}>
            {previewMutation.isPending ? 'Analisando...' : 'Analisar fatura'}
          </button>
          {previewMutation.isError && (
            <p className="text-danger">Não foi possível ler o arquivo. Confira o cartão e o formato selecionados.</p>
          )}
        </form>
      )}

      {preview && (
        <>
          <div className="card chart-section">
            <h3>Conferência</h3>
            <p>Saldo fatura anterior: {preview.saldoFaturaAnterior !== null ? formatBRL(preview.saldoFaturaAnterior) : '—'}</p>
            <p>Soma dos lançamentos extraídos: {formatBRL(somaEditada)}</p>
            <div className="form-field" style={{ maxWidth: 220 }}>
              <label>Valor total da fatura (a lançar)</label>
              <input value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div className="form-field">
                <label>Mês de competência</label>
                <input value={competenciaMes} onChange={(e) => setCompetenciaMes(e.target.value)} style={{ width: 70 }} />
              </div>
              <div className="form-field">
                <label>Ano de competência</label>
                <input value={competenciaAno} onChange={(e) => setCompetenciaAno(e.target.value)} style={{ width: 90 }} />
              </div>
            </div>
          </div>

          <div className="card chart-section">
            <h3>Revise os lançamentos ({itensEditados.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itensEditados.map((item, i) => (
                  <tr key={i}>
                    <td>{item.data}</td>
                    <td>
                      <input
                        value={item.descricao}
                        onChange={(e) => atualizarItem(i, 'descricao', e.target.value)}
                        style={{ width: 220 }}
                      />
                    </td>
                    <td>
                      <select
                        value={item.categoryId ?? ''}
                        onChange={(e) => atualizarItem(i, 'categoryId', e.target.value)}
                      >
                        <option value="">Sem categoria</option>
                        {categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={item.valor}
                        onChange={(e) => atualizarItem(i, 'valor', e.target.value)}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => removerItem(i)}>
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn" onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
              {confirmMutation.isPending ? 'Confirmando...' : 'Confirmar importação'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setPreview(null);
                setItensEditados([]);
              }}
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
