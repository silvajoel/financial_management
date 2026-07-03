'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goals', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      valor_alvo: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      valor_atual: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      data_alvo: { type: Sequelize.DATEONLY, allowNull: false },
      aporte_mensal_planejado: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      observacao: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('goals');
  },
};
