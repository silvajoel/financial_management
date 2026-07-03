"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNubankCsv = parseNubankCsv;
exports.parseNubankPdfBestEffort = parseNubankPdfBestEffort;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const genericCsvParser_1 = require("./genericCsvParser");
// Formato oficial de exportação do app Nubank (fatura): date,category,title,amount
function parseNubankCsv(buffer) {
    return (0, genericCsvParser_1.parseGenericCsv)(buffer).map((item) => ({
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
function normalizarData(diaMes) {
    const partes = diaMes.split('/');
    if (partes.length === 3)
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return `${new Date().getFullYear()}-${partes[1]}-${partes[0]}`;
}
/**
 * Extração best-effort do PDF da fatura Nubank: sem uma amostra real para
 * calibrar o layout (diferente do parser do BB), usa apenas o padrão
 * genérico data+valor por linha, sem seção/categoria do próprio banco.
 * Recomenda-se usar CSV (parseNubankCsv) sempre que possível.
 */
async function parseNubankPdfBestEffort(buffer) {
    const { text } = await (0, pdf_parse_1.default)(buffer);
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const itens = [];
    for (const line of lines) {
        const match = line.match(ITEM_REGEX);
        if (!match)
            continue;
        const [, descricaoRaw, diaMes, valorRaw, negativo] = match;
        const descricao = descricaoRaw.trim();
        if (!descricao)
            continue;
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
//# sourceMappingURL=nubankParser.js.map