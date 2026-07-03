'use strict';

const RULES_BY_CATEGORY = {
  Alimentação: ['restaurante', 'lanchonete', 'sorveteria', 'panificadora', 'supermercado', 'padaria', 'ifood', 'mercado'],
  Combustível: ['posto', 'auto posto', 'combustivel'],
  Compras: ['amazon', 'shein', 'netshoes', 'renner', 'shopee', 'mercado livre', 'magazine luiza', 'loja'],
  Assinaturas: ['netflix', 'spotify', 'prime video', 'amazon prime', 'wellhub', 'gympass', 'google', 'claude', 'anthropic'],
  'Tarifas e Encargos': ['iof', 'juros', 'multa', 'anuidade', 'encargo', 'tarifa'],
  Saúde: ['farmacia', 'drogaria', 'psicologa', 'psicologo', 'clinica'],
};

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const categories = await queryInterface.sequelize.query('SELECT id, nome FROM categories', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    const idByName = Object.fromEntries(categories.map((c) => [c.nome, c.id]));

    const rows = [];
    for (const [categoryName, patterns] of Object.entries(RULES_BY_CATEGORY)) {
      const categoryId = idByName[categoryName];
      if (!categoryId) continue;
      for (const padrao of patterns) {
        rows.push({ padrao, category_id: categoryId, created_at: now, updated_at: now });
      }
    }

    await queryInterface.bulkInsert('category_rules', rows);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('category_rules', null, {});
  },
};
