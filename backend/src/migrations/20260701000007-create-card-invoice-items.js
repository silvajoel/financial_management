'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('card_invoice_items', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      card_invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'card_invoices', key: 'id' },
        onDelete: 'CASCADE',
      },
      data: { type: Sequelize.DATEONLY, allowNull: false },
      descricao: { type: Sequelize.STRING, allowNull: false },
      pais: { type: Sequelize.STRING(2), allowNull: true },
      valor: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
      },
      portador: { type: Sequelize.STRING, allowNull: true },
      parcela_atual: { type: Sequelize.INTEGER, allowNull: true },
      parcela_total: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('card_invoice_items');
  },
};
