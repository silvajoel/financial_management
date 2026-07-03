import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type Instituicao = 'banco_do_brasil' | 'mercado_pago' | 'sicoob' | 'nubank';
export type TipoConta = 'credito' | 'debito' | 'investimento' | 'emprestimo';

export interface AccountAttributes {
  id: number;
  nome: string;
  instituicao: Instituicao;
  tipo: TipoConta;
  limite: number | null;
  saldo: number;
  ativa: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type AccountCreationAttributes = Optional<AccountAttributes, 'id' | 'limite' | 'saldo' | 'ativa'>;

export class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public nome!: string;
  public instituicao!: Instituicao;
  public tipo!: TipoConta;
  public limite!: number | null;
  public saldo!: number;
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
        type: DataTypes.ENUM('banco_do_brasil', 'mercado_pago', 'sicoob', 'nubank'),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM('credito', 'debito', 'investimento', 'emprestimo'),
        allowNull: false,
      },
      limite: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      saldo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      ativa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    { sequelize, tableName: 'accounts', underscored: true },
  );
  return Account;
}
