'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { nome: 'Transferência entre Contas', tipo: 'transferencia', cor: '#64748b', created_at: now, updated_at: now },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', { nome: 'Transferência entre Contas' }, {});
  },
};
