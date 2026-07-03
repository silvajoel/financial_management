import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CardInvoiceAttributes {
  id: number;
  accountId: number;
  competenciaMes: number;
  competenciaAno: number;
  valorTotal: number;
  dataFechamento: string | null;
  dataVencimento: string | null;
  transactionId: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CardInvoiceCreationAttributes = Optional<
  CardInvoiceAttributes,
  'id' | 'dataFechamento' | 'dataVencimento' | 'transactionId'
>;

export class CardInvoice
  extends Model<CardInvoiceAttributes, CardInvoiceCreationAttributes>
  implements CardInvoiceAttributes
{
  public id!: number;
  public accountId!: number;
  public competenciaMes!: number;
  public competenciaAno!: number;
  public valorTotal!: number;
  public dataFechamento!: string | null;
  public dataVencimento!: string | null;
  public transactionId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCardInvoice(sequelize: Sequelize) {
  CardInvoice.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      accountId: { type: DataTypes.INTEGER, allowNull: false, field: 'account_id' },
      competenciaMes: { type: DataTypes.INTEGER, allowNull: false, field: 'competencia_mes' },
      competenciaAno: { type: DataTypes.INTEGER, allowNull: false, field: 'competencia_ano' },
      valorTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_total' },
      dataFechamento: { type: DataTypes.DATEONLY, allowNull: true, field: 'data_fechamento' },
      dataVencimento: { type: DataTypes.DATEONLY, allowNull: true, field: 'data_vencimento' },
      transactionId: { type: DataTypes.INTEGER, allowNull: true, field: 'transaction_id' },
    },
    { sequelize, tableName: 'card_invoices', underscored: true },
  );
  return CardInvoice;
}
