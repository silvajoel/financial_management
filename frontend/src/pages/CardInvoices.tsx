import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { CardInvoice } from '../api/types';
import { formatBRL, NOMES_MES } from '../utils/format';

function InvoiceRow({ invoice }: { invoice: CardInvoice }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="card chart-section">
      <div
        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setAberto(!aberto)}
      >
        <div>
          <strong>{invoice.Account?.nome}</strong>
          <span className="text-muted" style={{ marginLeft: '0.75rem' }}>
            {NOMES_MES[invoice.competenciaMes - 1]}/{invoice.competenciaAno}
          </span>
        </div>
        <strong>{formatBRL(invoice.valorTotal)}</strong>
      </div>

      {aberto && invoice.itens && (
        <table style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {invoice.itens.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>{item.descricao}</td>
                <td className={item.valor < 0 ? 'text-success' : undefined}>{formatBRL(item.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
      {isLoading && <p className="text-muted">Carregando...</p>}
      {invoices?.length === 0 && <p className="text-muted">Nenhuma fatura importada ainda.</p>}
      {invoices?.map((invoice) => (
        <InvoiceRow key={invoice.id} invoice={invoice} />
      ))}
    </div>
  );
}
