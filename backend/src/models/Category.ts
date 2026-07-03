import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type TipoCategoria = 'receita' | 'despesa' | 'investimento';

export interface CategoryAttributes {
  id: number;
  nome: string;
  tipo: TipoCategoria;
  cor: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, 'id' | 'cor'>;

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public nome!: string;
  public tipo!: TipoCategoria;
  public cor!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCategory(sequelize: Sequelize) {
  Category.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: DataTypes.STRING, allowNull: false },
      tipo: {
        type: DataTypes.ENUM('receita', 'despesa', 'investimento'),
        allowNull: false,
      },
      cor: { type: DataTypes.STRING(7), allowNull: true },
    },
    { sequelize, tableName: 'categories', underscored: true },
  );
  return Category;
}
