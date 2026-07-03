"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
exports.initCategory = initCategory;
const sequelize_1 = require("sequelize");
class Category extends sequelize_1.Model {
}
exports.Category = Category;
function initCategory(sequelize) {
    Category.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        nome: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        tipo: {
            type: sequelize_1.DataTypes.ENUM('receita', 'despesa', 'investimento', 'transferencia'),
            allowNull: false,
        },
        cor: { type: sequelize_1.DataTypes.STRING(7), allowNull: true },
    }, { sequelize, tableName: 'categories', underscored: true });
    return Category;
}
//# sourceMappingURL=Category.js.map