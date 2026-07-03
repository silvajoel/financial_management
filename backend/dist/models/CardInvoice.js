"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardInvoice = void 0;
exports.initCardInvoice = initCardInvoice;
const sequelize_1 = require("sequelize");
class CardInvoice extends sequelize_1.Model {
}
exports.CardInvoice = CardInvoice;
function initCardInvoice(sequelize) {
    CardInvoice.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        accountId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'account_id' },
        competenciaMes: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'competencia_mes' },
        competenciaAno: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'competencia_ano' },
        valorTotal: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_total' },
        dataFechamento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true, field: 'data_fechamento' },
        dataVencimento: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true, field: 'data_vencimento' },
        transactionId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'transaction_id' },
    }, { sequelize, tableName: 'card_invoices', underscored: true });
    return CardInvoice;
}
//# sourceMappingURL=CardInvoice.js.map