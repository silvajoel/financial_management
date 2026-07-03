export type Instituicao = string;
export type TipoConta = 'credito' | 'debito' | 'investimento' | 'emprestimo';
export type TipoCategoria = 'receita' | 'despesa' | 'investimento' | 'transferencia';
export type StatusTransacao = 'pago' | 'parcial' | 'em_aberto' | 'liquidado';

export interface Account {
  id: number;
  nome: string;
  instituicao: Instituicao;
  tipo: TipoConta;
  limite: number | null;
  saldo: number;
  bandeira: string | null;
  ultimosDigitos: string | null;
  ativa: boolean;
}

export interface Category {
  id: number;
  nome: string;
  tipo: TipoCategoria;
  cor: string | null;
}

export interface Transaction {
  id: number;
  accountId: number;
  categoryId: number;
  descricao: string;
  valorTotal: number;
  valorPago: number;
  status: StatusTransacao;
  competenciaMes: number;
  competenciaAno: number;
  dataVencimento: string | null;
  dataPagamento: string | null;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
  recorrente: boolean;
  origem: 'manual' | 'import_fatura';
  observacao: string | null;
  Account?: Account;
  Category?: Category;
}

export interface Goal {
  id: number;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string;
  aporteMensalPlanejado: number | null;
  accountId: number | null;
  observacao: string | null;
}

export interface TransactionSummary {
  mes: number;
  ano: number;
  receitaTotal: number;
  despesaTotal: number;
  investimentoTotal: number;
  saldo: number;
  porCategoria: { categoryId: number; nome: string; cor: string | null; total: number }[];
}

export interface CardInvoiceItem {
  id: number;
  data: string;
  descricao: string;
  pais: string | null;
  valor: number;
  categoryId: number | null;
  portador: string | null;
  responsavel: string | null;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
}

export interface CardInvoice {
  id: number;
  accountId: number;
  competenciaMes: number;
  competenciaAno: number;
  valorTotal: number;
  dataFechamento: string | null;
  dataVencimento: string | null;
  transactionId: number | null;
  Account?: Account;
  itens?: CardInvoiceItem[];
}
