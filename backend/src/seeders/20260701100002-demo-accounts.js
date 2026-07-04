'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    await queryInterface.bulkInsert('accounts', [
      { nome: 'Banco do Brasil - Conta Corrente', instituicao: 'banco_do_brasil', tipo: 'conta_corrente', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Banco do Brasil - Crédito', instituicao: 'banco_do_brasil', tipo: 'credito', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Mercado Pago - Conta Corrente', instituicao: 'mercado_pago', tipo: 'conta_corrente', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Mercado Pago - Investimentos', instituicao: 'mercado_pago', tipo: 'investimento', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Mercado Pago - Cofrinho', instituicao: 'mercado_pago', tipo: 'investimento', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Sicoob - Empréstimo', instituicao: 'sicoob', tipo: 'emprestimo', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Nubank - Conta Corrente', instituicao: 'nubank', tipo: 'conta_corrente', limite: null, ativa: true, created_at: now, updated_at: now },
      { nome: 'Nubank - Crédito', instituicao: 'nubank', tipo: 'credito', limite: null, ativa: true, created_at: now, updated_at: now },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('accounts', null, {});
  },
};
