'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accounts', 'instituicao', {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accounts', 'instituicao', {
      type: Sequelize.ENUM('banco_do_brasil', 'mercado_pago', 'sicoob', 'nubank'),
      allowNull: false,
    });
  },
};
