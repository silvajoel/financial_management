import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserAttributes {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public nome!: string;
  public email!: string;
  public senhaHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      senhaHash: { type: DataTypes.STRING, allowNull: false, field: 'senha_hash' },
    },
    { sequelize, tableName: 'users', underscored: true },
  );
  return User;
}
