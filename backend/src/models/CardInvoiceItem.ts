import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CardInvoiceItemAttributes {
  id: number;
  cardInvoiceId: number;
  data: string;
  descricao: string;
  pais: string | null;
  valor: number;
  categoryId: number | null;
  portador: string | null;
  responsavel: string | null;
  parcelaAtual: number | null;
  parcelaTotal: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CardInvoiceItemCreationAttributes = Optional<
  CardInvoiceItemAttributes,
  'id' | 'pais' | 'categoryId' | 'portador' | 'responsavel' | 'parcelaAtual' | 'parcelaTotal'
>;

export class CardInvoiceItem
  extends Model<CardInvoiceItemAttributes, CardInvoiceItemCreationAttributes>
  implements CardInvoiceItemAttributes
{
  public id!: number;
  public cardInvoiceId!: number;
  public data!: string;
  public descricao!: string;
  public pais!: string | null;
  public valor!: number;
  public categoryId!: number | null;
  public portador!: string | null;
  public responsavel!: string | null;
  public parcelaAtual!: number | null;
  public parcelaTotal!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCardInvoiceItem(sequelize: Sequelize) {
  CardInvoiceItem.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      cardInvoiceId: { type: DataTypes.INTEGER, allowNull: false, field: 'card_invoice_id' },
      data: { type: DataTypes.DATEONLY, allowNull: false },
      descricao: { type: DataTypes.STRING, allowNull: false },
      pais: { type: DataTypes.STRING(2), allowNull: true },
      valor: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
      categoryId: { type: DataTypes.INTEGER, allowNull: true, field: 'category_id' },
      portador: { type: DataTypes.STRING, allowNull: true },
      responsavel: { type: DataTypes.STRING(50), allowNull: true },
      parcelaAtual: { type: DataTypes.INTEGER, allowNull: true, field: 'parcela_atual' },
      parcelaTotal: { type: DataTypes.INTEGER, allowNull: true, field: 'parcela_total' },
    },
    { sequelize, tableName: 'card_invoice_items', underscored: true },
  );
  return CardInvoiceItem;
}
