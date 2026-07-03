// Sequelize serializa colunas DECIMAL como string no JSON (para preservar
// precisão), então todo valor monetário vindo da API precisa ser coagido
// para number antes de formatar.
export function formatBRL(valor: number | string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCompactBRL(valor: number | string): string {
  const num = Number(valor);
  const abs = Math.abs(num);
  if (abs >= 1_000_000) return `R$ ${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `R$ ${(num / 1_000).toFixed(1)}K`;
  return formatBRL(num);
}

export const NOMES_MES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];
