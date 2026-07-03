import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface CategoryRuleAttributes {
  id: number;
  padrao: string;
  categoryId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryRuleCreationAttributes = Optional<CategoryRuleAttributes, 'id'>;

export class CategoryRule
  extends Model<CategoryRuleAttributes, CategoryRuleCreationAttributes>
  implements CategoryRuleAttributes
{
  public id!: number;
  public padrao!: string;
  public categoryId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initCategoryRule(sequelize: Sequelize) {
  CategoryRule.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      padrao: { type: DataTypes.STRING, allowNull: false },
      categoryId: { type: DataTypes.INTEGER, allowNull: false, field: 'category_id' },
    },
    { sequelize, tableName: 'category_rules', underscored: true },
  );
  return CategoryRule;
}
