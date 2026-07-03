'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'RESTRICT',
      },
      descricao: { type: Sequelize.STRING, allowNull: false },
      valor_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      valor_pago: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM('pago', 'parcial', 'em_aberto', 'liquidado'),
        allowNull: false,
        defaultValue: 'em_aberto',
      },
      competencia_mes: { type: Sequelize.INTEGER, allowNull: false },
      competencia_ano: { type: Sequelize.INTEGER, allowNull: false },
      data_vencimento: { type: Sequelize.DATEONLY, allowNull: true },
      data_pagamento: { type: Sequelize.DATEONLY, allowNull: true },
      parcela_atual: { type: Sequelize.INTEGER, allowNull: true },
      parcela_total: { type: Sequelize.INTEGER, allowNull: true },
      recorrente: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      origem: {
        type: Sequelize.ENUM('manual', 'import_fatura'),
        allowNull: false,
        defaultValue: 'manual',
      },
      observacao: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('transactions', ['competencia_ano', 'competencia_mes']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('transactions');
  },
};
