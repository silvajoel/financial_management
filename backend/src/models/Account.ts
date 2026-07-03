import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type Instituicao = string;
export type TipoConta = 'credito' | 'debito' | 'investimento' | 'emprestimo';

export interface AccountAttributes {
  id: number;
  nome: string;
  instituicao: Instituicao;
  tipo: TipoConta;
  limite: number | null;
  saldo: number;
  bandeira: string | null;
  ultimosDigitos: string | null;
  ativa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type AccountCreationAttributes = Optional<
  AccountAttributes,
  'id' | 'limite' | 'saldo' | 'bandeira' | 'ultimosDigitos' | 'ativa'
>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public nome!: string;
  public instituicao!: Instituicao;
  public tipo!: TipoConta;
  public limite!: number | null;
  public saldo!: number;
  public bandeira!: string | null;
  public ultimosDigitos!: string | null;
  public ativa!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initAccount(sequelize: Sequelize) {
  Account.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: DataTypes.STRING, allowNull: false },
      instituicao: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('credito', 'debito', 'investimento', 'emprestimo'),
        allowNull: false,
      },
      limite: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      saldo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      bandeira: { type: DataTypes.STRING(30), allowNull: true },
      ultimosDigitos: { type: DataTypes.STRING(4), allowNull: true, field: 'ultimos_digitos' },
      ativa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'accounts', underscored: true },
  );
  return Account;
}
