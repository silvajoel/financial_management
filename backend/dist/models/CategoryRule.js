"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRule = void 0;
exports.initCategoryRule = initCategoryRule;
const sequelize_1 = require("sequelize");
class CategoryRule extends sequelize_1.Model {
}
exports.CategoryRule = CategoryRule;
function initCategoryRule(sequelize) {
    CategoryRule.init({
        id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        padrao: { type: sequelize_1.DataTypes.STRING, allowNull: false },
        categoryId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, field: 'category_id' },
    }, { sequelize, tableName: 'category_rules', underscored: true });
    return CategoryRule;
}
//# sourceMappingURL=CategoryRule.js.map