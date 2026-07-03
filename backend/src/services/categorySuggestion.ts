import { Category, CategoryRule } from '../models';

const SECAO_BB_PARA_CATEGORIA: Record<string, string> = {
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

let regrasCache: { padrao: string; categoryId: number }[] | null = null;
let categoriasPorNomeCache: Record<string, number> | null = null;

async function carregarCache() {
  if (!regrasCache) {
    const regras = await CategoryRule.findAll();
    regrasCache = regras.map((r) => ({ padrao: r.padrao.toLowerCase(), categoryId: r.categoryId }));
  }
  if (!categoriasPorNomeCache) {
    const categorias = await Category.findAll();
    categoriasPorNomeCache = Object.fromEntries(categorias.map((c) => [c.nome, c.id]));
  }
}

export function resetSuggestionCache() {
  regrasCache = null;
  categoriasPorNomeCache = null;
}

export async function suggestCategoryId(descricao: string, secaoBB: string | null): Promise<number | null> {
  await carregarCache();
  const descLower = descricao.toLowerCase();

  const regraEncontrada = regrasCache!.find((r) => descLower.includes(r.padrao));
  if (regraEncontrada) return regraEncontrada.categoryId;

  if (secaoBB && SECAO_BB_PARA_CATEGORIA[secaoBB]) {
    const nome = SECAO_BB_PARA_CATEGORIA[secaoBB];
    if (categoriasPorNomeCache![nome]) return categoriasPorNomeCache![nome];
  }

  return categoriasPorNomeCache!['Outras Despesas'] ?? null;
}
