'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accounts', 'tipo', {
      type: Sequelize.ENUM('credito', 'debito', 'conta_corrente', 'investimento', 'emprestimo'),
      allowNull: false,
    });
    await queryInterface.sequelize.query("UPDATE accounts SET tipo = 'conta_corrente' WHERE tipo = 'debito'");
    await queryInterface.changeColumn('accounts', 'tipo', {
      type: Sequelize.ENUM('credito', 'conta_corrente', 'investimento', 'emprestimo'),
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accounts', 'tipo', {
      type: Sequelize.ENUM('credito', 'debito', 'conta_corrente', 'investimento', 'emprestimo'),
      allowNull: false,
    });
    await queryInterface.sequelize.query("UPDATE accounts SET tipo = 'debito' WHERE tipo = 'conta_corrente'");
    await queryInterface.changeColumn('accounts', 'tipo', {
      type: Sequelize.ENUM('credito', 'debito', 'investimento', 'emprestimo'),
      allowNull: false,
    });
  },
};
