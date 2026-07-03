'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('accounts', 'bandeira', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
    await queryInterface.addColumn('accounts', 'ultimos_digitos', {
      type: Sequelize.STRING(4),
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('accounts', 'bandeira');
    await queryInterface.removeColumn('accounts', 'ultimos_digitos');
  },
};
