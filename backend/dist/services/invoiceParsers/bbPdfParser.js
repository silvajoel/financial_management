"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBBInvoicePdf = parseBBInvoicePdf;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const SECOES_CONHECIDAS = [
    'Pagamentos',
    'Creditos diversos',
    'Restaurantes',
    'Compras diversas',
    'Compras/Pgto Contas Parc',
    'Compras por mala direta/telefone',
    'Debitos diversos',
    'Anuidades',
    'Encargos',
];
const CARDHOLDER_REGEX = /^\d{2}-\s*(.+?)\s+Cartao N\.\s*\d+\s*$/;
// Descrição em .* (greedy): a data real do lançamento fica mais perto do valor,
// então o backtracking encontra a ÚLTIMA ocorrência de dd/mm na linha — evita
// confundir com "PARC 04/10" ou outras datas embutidas na própria descrição.
const ITEM_REGEX = /^(.*)(\d{2}\/\d{2})([A-Za-z0-9]{0,4})(R\$|US\$)\s*([\d.]+,\d{2})\s*(-)?\s*$/;
const PARCELA_REGEX = /PARC\s*(\d+)\/(\d+)/i;
function parseValorBR(raw) {
    return parseFloat(raw.replace(/\./g, '').replace(',', '.'));
}
function extrairMetadados(texto) {
    const vencimentoMatch = texto.match(/Vencimento\s*\n?(\d{2}\/\d{2}\/\d{4})/);
    const fechamentoMatch = texto.match(/Fatura fechada em\s*\n?[\s\S]{0,60}?(\d{2}\/\d{2}\/\d{4})/);
    const totalMatch = texto.match(/\nTotal\s*R\$\s*([\d.]+,\d{2})/);
    const saldoAnteriorMatch = texto.match(/Saldo fatura anteriorR\$\s*([\d.]+,\d{2})/);
    return {
        dataVencimento: vencimentoMatch ? toIso(vencimentoMatch[1]) : null,
        dataFechamento: fechamentoMatch ? toIso(fechamentoMatch[1]) : null,
        valorTotal: totalMatch ? parseValorBR(totalMatch[1]) : null,
        saldoFaturaAnterior: saldoAnteriorMatch ? parseValorBR(saldoAnteriorMatch[1]) : null,
    };
}
function toIso(dataBr) {
    const [dia, mes, ano] = dataBr.split('/');
    return `${ano}-${mes}-${dia}`;
}
function inferirAno(diaMes, dataFechamento) {
    const [dia, mes] = diaMes.split('/');
    if (!dataFechamento) {
        return `${new Date().getFullYear()}-${mes}-${dia}`;
    }
    const [anoFechamento, mesFechamento] = dataFechamento.split('-').map(Number);
    let ano = anoFechamento;
    // Item com mês bem à frente do fechamento (ex.: fatura fecha em janeiro,
    // item referencia dezembro) pertence ao ano anterior.
    if (Number(mes) - mesFechamento > 3) {
        ano -= 1;
    }
    return `${ano}-${mes}-${dia}`;
}
async function parseBBInvoicePdf(buffer) {
    const { text } = await (0, pdf_parse_1.default)(buffer);
    const metadados = extrairMetadados(text);
    const lines = text.split('\n').map((l) => l.trim());
    const startIdx = lines.findIndex((l) => l.includes('Lançamentos nesta fatura'));
    let endIdx = lines.findIndex((l) => l.startsWith('Parcelamentos Próxima Fatura'));
    if (endIdx === -1)
        endIdx = lines.length;
    const itens = [];
    let secaoAtual = null;
    let portadorAtual = null;
    for (let i = startIdx === -1 ? 0 : startIdx + 1; i < endIdx; i++) {
        const line = lines[i];
        if (!line)
            continue;
        if (/^Página \d+\/\d+$/.test(line))
            continue;
        if (/^DataDescriçãoPaísValor$/.test(line))
            continue;
        const cardholderMatch = line.match(CARDHOLDER_REGEX);
        if (cardholderMatch) {
            portadorAtual = cardholderMatch[1].trim();
            secaoAtual = null;
            continue;
        }
        const secaoConhecida = SECOES_CONHECIDAS.find((s) => line === s || line === `${s} `);
        if (secaoConhecida) {
            secaoAtual = secaoConhecida;
            continue;
        }
        if (line.startsWith('Subtotal'))
            continue;
        if (line.startsWith('Total'))
            break;
        const match = line.match(ITEM_REGEX);
        if (!match)
            continue;
        const [, descricaoRaw, diaMes, pais, , valorRaw, negativo] = match;
        const descricao = descricaoRaw.trim();
        if (!descricao)
            continue;
        const parcelaMatch = descricao.match(PARCELA_REGEX);
        itens.push({
            data: inferirAno(diaMes, metadados.dataFechamento),
            descricao,
            pais: pais ? pais.toUpperCase() : null,
            valor: parseValorBR(valorRaw) * (negativo ? -1 : 1),
            portador: portadorAtual,
            secaoBB: secaoAtual,
            parcelaAtual: parcelaMatch ? Number(parcelaMatch[1]) : null,
            parcelaTotal: parcelaMatch ? Number(parcelaMatch[2]) : null,
        });
    }
    return { ...metadados, itens };
}
//# sourceMappingURL=bbPdfParser.js.map