import pdf from 'pdf-parse';
import { parseGenericCsv } from './genericCsvParser';
import { ParsedInvoiceItem } from './bbPdfParser';

// Formato oficial de exportação do app Nubank (fatura): date,category,title,amount
export function parseNubankCsv(buffer: Buffer): ParsedInvoiceItem[] {
  return parseGenericCsv(buffer).map((item) => ({
    data: item.data,
    descricao: item.descricao,
    valor: item.valor,
    pais: null,
    portador: null,
    secaoBB: item.categoriaTexto,
    parcelaAtual: null,
    parcelaTotal: null,
  }));
}

const ITEM_REGEX = /^(.*)(\d{2}\/\d{2}(?:\/\d{4})?)\s*(?:R\$)?\s*([\d.]+,\d{2})\s*(-)?\s*$/;

function normalizarData(diaMes: string): string {
  const partes = diaMes.split('/');
  if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
  return `${new Date().getFullYear()}-${partes[1]}-${partes[0]}`;
}

/**
 * Extração best-effort do PDF da fatura Nubank: sem uma amostra real para
 * calibrar o layout (diferente do parser do BB), usa apenas o padrão
 * genérico data+valor por linha, sem seção/categoria do próprio banco.
 * Recomenda-se usar CSV (parseNubankCsv) sempre que possível.
 */
export async function parseNubankPdfBestEffort(buffer: Buffer): Promise<ParsedInvoiceItem[]> {
  const { text } = await pdf(buffer);
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const itens: ParsedInvoiceItem[] = [];
  for (const line of lines) {
    const match = line.match(ITEM_REGEX);
    if (!match) continue;
    const [, descricaoRaw, diaMes, valorRaw, negativo] = match;
    const descricao = descricaoRaw.trim();
    if (!descricao) continue;

    itens.push({
      data: normalizarData(diaMes),
      descricao,
      pais: null,
      valor: parseFloat(valorRaw.replace(/\./g, '').replace(',', '.')) * (negativo ? -1 : 1),
      portador: null,
      secaoBB: null,
      parcelaAtual: null,
      parcelaTotal: null,
    });
  }
  return itens;
}
