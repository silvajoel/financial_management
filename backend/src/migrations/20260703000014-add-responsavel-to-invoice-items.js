'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('card_invoice_items', 'responsavel', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('card_invoice_items', 'responsavel');
  },
};
