'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    await queryInterface.bulkInsert('accounts', [
      { nome: 'Banco do Brasil - Débito', instituicao: 'banco_do_brasil', tipo: 'debito', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Banco do Brasil - Crédito', instituicao: 'banco_do_brasil', tipo: 'credito', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Mercado Pago - Débito', instituicao: 'mercado_pago', tipo: 'debito', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Mercado Pago - Investimentos', instituicao: 'mercado_pago', tipo: 'investimento', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Sicoob - Empréstimo', instituicao: 'sicoob', tipo: 'emprestimo', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Nubank - Débito', instituicao: 'nubank', tipo: 'debito', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Nubank - Crédito', instituicao: 'nubank', tipo: 'credito', limite: null, ativa: true, created_at: now, updated_at: now },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('accounts', null, {});
  },
};
