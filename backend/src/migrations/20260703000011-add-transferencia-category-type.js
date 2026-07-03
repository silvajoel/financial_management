'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('categories', 'tipo', {
      type: Sequelize.ENUM('receita', 'despesa', 'investimento', 'transferencia'),
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('categories', 'tipo', {
      type: Sequelize.ENUM('receita', 'despesa', 'investimento'),
      allowNull: false,
    });
  },
};
