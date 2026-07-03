import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface GoalAttributes {
  id: number;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string;
  aporteMensalPlanejado: number | null;
  accountId: number | null;
  observacao: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type GoalCreationAttributes = Optional<
  GoalAttributes,
  'id' | 'valorAtual' | 'aporteMensalPlanejado' | 'accountId' | 'observacao'
>;

export class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: number;
  public nome!: string;
  public valorAlvo!: number;
  public valorAtual!: number;
  public dataAlvo!: string;
  public aporteMensalPlanejado!: number | null;
  public accountId!: number | null;
  public observacao!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initGoal(sequelize: Sequelize) {
  Goal.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: DataTypes.STRING, allowNull: false },
      valorAlvo: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_alvo' },
      valorAtual: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'valor_atual' },
      dataAlvo: { type: DataTypes.DATEONLY, allowNull: false, field: 'data_alvo' },
      aporteMensalPlanejado: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        field: 'aporte_mensal_planejado',
      },
      accountId: { type: DataTypes.INTEGER, allowNull: true, field: 'account_id' },
      observacao: { type: DataTypes.TEXT, allowNull: true },
    },
    { sequelize, tableName: 'goals', underscored: true },
  );
  return Goal;
}
