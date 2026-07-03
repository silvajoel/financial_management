'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nome: { type: Sequelize.STRING, allowNull: false },
      instituicao: {
        type: Sequelize.ENUM('banco_do_brasil', 'mercado_pago', 'sicoob', 'nubank'),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('credito', 'debito', 'investimento', 'emprestimo'),
        allowNull: false,
      },
      limite: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      ativa: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('accounts');
  },
};
