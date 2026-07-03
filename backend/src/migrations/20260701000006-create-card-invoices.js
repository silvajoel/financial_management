'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('card_invoices', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      competencia_mes: { type: Sequelize.INTEGER, allowNull: false },
      competencia_ano: { type: Sequelize.INTEGER, allowNull: false },
      valor_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      data_fechamento: { type: Sequelize.DATEONLY, allowNull: true },
      data_vencimento: { type: Sequelize.DATEONLY, allowNull: true },
      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'transactions', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('card_invoices');
  },
};
