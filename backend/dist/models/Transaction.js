"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
exports.initTransaction = initTransaction;
const sequelize_1 = require("sequelize");
class Transaction extends sequelize_1.Model {
}
exports.Transaction = Transaction;
function initTransaction(sequelize) {
    Transaction.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        accountId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'account_id' },
        categoryId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'category_id' },
        descricao: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        valorTotal: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_total' },
        valorPago: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'valor_pago' },
        status: {
            type: sequelize_1.DataTypes.ENUM('pago', 'parcial', 'em_aberto', 'liquidado'),
            allowNull: false,
            defaultValue: 'em_aberto',
        },
        competenciaMes: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'competencia_mes' },
        competenciaAno: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'competencia_ano' },
        dataVencimento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true, field: 'data_vencimento' },
        dataPagamento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true, field: 'data_pagamento' },
        parcelaAtual: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'parcela_atual' },
        parcelaTotal: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'parcela_total' },
        recorrente: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        origem: {
            type: sequelize_1.DataTypes.ENUM('manual', 'import_fatura'),
            allowNull: false,
            defaultValue: 'manual',
        },
        observacao: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    }, { sequelize, tableName: 'transactions', underscored: true });
    return Transaction;
}
//# sourceMappingURL=Transaction.js.map