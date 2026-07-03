"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSuggestionCache = resetSuggestionCache;
exports.suggestCategoryId = suggestCategoryId;
const models_1 = require("../models");
const SECAO_BB_PARA_CATEGORIA = {
    Pagamentos: 'Outras Despesas',
    'Creditos diversos': 'Outras Despesas',
    Restaurantes: 'Alimentação',
    'Compras diversas': 'Compras',
    'Compras/Pgto Contas Parc': 'Compras',
    'Compras por mala direta/telefone': 'Compras',
    'Debitos diversos': 'Tarifas e Encargos',
    Anuidades: 'Tarifas e Encargos',
    Encargos: 'Tarifas e Encargos',
};
let regrasCache = null;
let categoriasPorNomeCache = null;
async function carregarCache() {
    if (!regrasCache) {
        const regras = await models_1.CategoryRule.findAll();
        regrasCache = regras.map((r) => ({ padrao: r.padrao.toLowerCase(), categoryId: r.categoryId }));
    }
    if (!categoriasPorNomeCache) {
        const categorias = await models_1.Category.findAll();
        categoriasPorNomeCache = Object.fromEntries(categorias.map((c) => [c.nome, c.id]));
    }
}
function resetSuggestionCache() {
    regrasCache = null;
    categoriasPorNomeCache = null;
}
async function suggestCategoryId(descricao, secaoBB) {
    await carregarCache();
    const descLower = descricao.toLowerCase();
    const regraEncontrada = regrasCache.find((r) => descLower.includes(r.padrao));
    if (regraEncontrada)
        return regraEncontrada.categoryId;
    if (secaoBB && SECAO_BB_PARA_CATEGORIA[secaoBB]) {
        const nome = SECAO_BB_PARA_CATEGORIA[secaoBB];
        if (categoriasPorNomeCache[nome])
            return categoriasPorNomeCache[nome];
    }
    return categoriasPorNomeCache['Outras Despesas'] ?? null;
}
//# sourceMappingURL=categorySuggestion.js.map