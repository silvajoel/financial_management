"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
exports.initAccount = initAccount;
const sequelize_1 = require("sequelize");
class Account extends sequelize_1.Model {
}
exports.Account = Account;
function initAccount(sequelize) {
    Account.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nome: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        instituicao: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        tipo: {
            type: sequelize_1.DataTypes.ENUM('credito', 'debito', 'investimento', 'emprestimo'),
            allowNull: false,
        },
        limite: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: true },
        saldo: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        bandeira: { type: sequelize_1.DataTypes.STRING(30), allowNull: true },
        ultimosDigitos: { type: sequelize_1.DataTypes.STRING(4), allowNull: true, field: 'ultimos_digitos' },
        ativa: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    }, { sequelize, tableName: 'accounts', underscored: true });
    return Account;
}
//# sourceMappingURL=Account.js.map