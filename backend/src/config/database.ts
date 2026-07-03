import { Sequelize } from 'sequelize';

const env = require('./config.js')[process.env.NODE_ENV || 'development'];

export const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  port: env.port,
  dialect: 'mysql',
  logging: false,
});
