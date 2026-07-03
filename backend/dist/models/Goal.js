"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
exports.initGoal = initGoal;
const sequelize_1 = require("sequelize");
class Goal extends sequelize_1.Model {
}
exports.Goal = Goal;
function initGoal(sequelize) {
    Goal.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nome: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        valorAlvo: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, field: 'valor_alvo' },
        valorAtual: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'valor_atual' },
        dataAlvo: { type: sequelize_1.DataTypes.DATEONLY, allowNull: false, field: 'data_alvo' },
        aporteMensalPlanejado: {
            type: sequelize_1.DataTypes.DECIMAL(12, 2),
            allowNull: true,
            field: 'aporte_mensal_planejado',
        },
        accountId: { type: sequelize_1.DataTypes.INTEGER, allowNull: true, field: 'account_id' },
        observacao: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    }, { sequelize, tableName: 'goals', underscored: true });
    return Goal;
}
//# sourceMappingURL=Goal.js.map