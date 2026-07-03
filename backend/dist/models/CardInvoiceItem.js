"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardInvoiceItem = void 0;
exports.initCardInvoiceItem = initCardInvoiceItem;
const sequelize_1 = require("sequelize");
class CardInvoiceItem extends sequelize_1.Model {
}
exports.CardInvoiceItem = CardInvoiceItem;
function initCardInvoiceItem(sequelize) {
    CardInvoiceItem.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        cardInvoiceId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'card_invoice_id' },
        data: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false },
        descricao: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        pais: { type: sequelize_1.DataTypes.STRING(2), allowNull: true },
        valor: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false },
        categoryId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'category_id' },
        portador: { type: sequelize_1.DataTypes.STRING, allowNull: true },
        responsavel: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
        parcelaAtual: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'parcela_atual' },
        parcelaTotal: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'parcela_total' },
    }, { sequelize, tableName: 'card_invoice_items', underscored: true });
    return CardInvoiceItem;
}
//# sourceMappingURL=CardInvoiceItem.js.map