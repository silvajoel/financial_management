"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
// Autossuficiente de propósito: não depende de config.js (que é só para o
// sequelize-cli). config.js é JS puro e o tsc não o copia para dist/, então
// se database.ts dependesse dele em runtime, o app quebraria após o build.
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'financeiro', process.env.DB_USER || 'financeiro', process.env.DB_PASSWORD || 'financeiro123', {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: { charset: 'utf8mb4', decimalNumbers: true },
    logging: false,
});
//# sourceMappingURL=database.js.map