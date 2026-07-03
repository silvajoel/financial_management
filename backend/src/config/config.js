require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'financeiro',
  password: process.env.DB_PASSWORD || 'financeiro123',
  database: process.env.DB_NAME || 'financeiro',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  // decimalNumbers é opção do driver mysql2: sem ela, colunas DECIMAL voltam
  // como string no JSON (comportamento padrão, pra preservar precisão).
  dialectOptions: { charset: 'utf8mb4', decimalNumbers: true },
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
};
