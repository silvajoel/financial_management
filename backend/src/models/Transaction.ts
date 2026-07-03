import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type StatusTransacao = 'pago' | 'parcial' | 'em_aberto' | 'liquidado';
export type OrigemTransacao = 'manual' | 'import_fatura';

export interface TransactionAttributes {
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
  origem: OrigemTransacao;
  observacao: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  'id' | 'valorPago' | 'dataVencimento' | 'dataPagamento' | 'parcelaAtual' | 'parcelaTotal' | 'recorrente' | 'origem' | 'observacao'
>;

export class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public accountId!: number;
  public categoryId!: number;
  public descricao!: string;
  public valorTotal!: number;
  public valorPago!: number;
  public status!: StatusTransacao;
  public competenciaMes!: number;
  public competenciaAno!: number;
  public dataVencimento!: string | null;
  public dataPagamento!: string | null;
  public parcelaAtual!: number | null;
  public parcelaTotal!: number | null;
  public recorrente!: boolean;
  public origem!: OrigemTransacao;
  public observacao!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initTransaction(sequelize: Sequelize) {
  Transaction.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      accountId: { type: DataTypes.INTEGER, allowNull: false, field: 'account_id' },
      categoryId: { type: DataTypes.INTEGER, allowNull: false, field: 'category_id' },
      descricao: { type: DataTypes.STRING, allowNull: false },
      valorTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_total' },
      valorPago: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'valor_pago' },
      status: {
        type: DataTypes.ENUM('pago', 'parcial', 'em_aberto', 'liquidado'),
        allowNull: false,
        defaultValue: 'em_aberto',
      },
      competenciaMes: { type: DataTypes.INTEGER, allowNull: false, field: 'competencia_mes' },
      competenciaAno: { type: DataTypes.INTEGER, allowNull: false, field: 'competencia_ano' },
      dataVencimento: { type: DataTypes.DATEONLY, allowNull: true, field: 'data_vencimento' },
      dataPagamento: { type: DataTypes.DATEONLY, allowNull: true, field: 'data_pagamento' },
      parcelaAtual: { type: DataTypes.INTEGER, allowNull: true, field: 'parcela_atual' },
      parcelaTotal: { type: DataTypes.INTEGER, allowNull: true, field: 'parcela_total' },
      recorrente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      origem: {
        type: DataTypes.ENUM('manual', 'import_fatura'),
        allowNull: false,
        defaultValue: 'manual',
      },
      observacao: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize, tableName: 'transactions', underscored: true },
  );
  return Transaction;
}
