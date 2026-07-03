'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    await queryInterface.bulkInsert('categories', [
      { nome: 'Aluguel', tipo: 'despesa', cor: '#b45309', created_at: now, updated_at: now },
      { nome: 'Conta de Luz', tipo: 'despesa', cor: '#f59e0b', created_at: now, updated_at: now },
      { nome: 'Água', tipo: 'despesa', cor: '#0ea5e9', created_at: now, updated_at: now },
      { nome: 'Telefone', tipo: 'despesa', cor: '#6366f1', created_at: now, updated_at: now },
      { nome: 'Hosting', tipo: 'despesa', cor: '#7c3aed', created_at: now, updated_at: now },
      { nome: 'Cartão de Crédito', tipo: 'despesa', cor: '#dc2626', created_at: now, updated_at: now },
      { nome: 'Empréstimos e Parcelas', tipo: 'despesa', cor: '#b91c1c', created_at: now, updated_at: now },
      { nome: 'Assinaturas', tipo: 'despesa', cor: '#9333ea', created_at: now, updated_at: now },
      { nome: 'Alimentação', tipo: 'despesa', cor: '#16a34a', created_at: now, updated_at: now },
      { nome: 'Combustível', tipo: 'despesa', cor: '#ea580c', created_at: now, updated_at: now },
      { nome: 'Compras', tipo: 'despesa', cor: '#db2777', created_at: now, updated_at: now },
      { nome: 'Saúde', tipo: 'despesa', cor: '#0d9488', created_at: now, updated_at: now },
      { nome: 'Tarifas e Encargos', tipo: 'despesa', cor: '#78716c', created_at: now, updated_at: now },
      { nome: 'Outras Despesas', tipo: 'despesa', cor: '#57534e', created_at: now, updated_at: now },
      { nome: 'Salário', tipo: 'receita', cor: '#15803d', created_at: now, updated_at: now },
      { nome: 'Trabalhos Freelancer', tipo: 'receita', cor: '#059669', created_at: now, updated_at: now },
      { nome: 'Outras Receitas', tipo: 'receita', cor: '#10b981', created_at: now, updated_at: now },
      { nome: 'Investimentos', tipo: 'investimento', cor: '#2563eb', created_at: now, updated_at: now },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
