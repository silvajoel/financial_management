"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGenericCsv = parseGenericCsv;
const sync_1 = require("csv-parse/sync");
function detectarDelimitador(texto) {
    const primeiraLinha = texto.split('\n')[0] || '';
    return primeiraLinha.includes(';') ? ';' : ',';
}
function normalizarData(bruta) {
    const valor = bruta.trim();
    if (!valor)
        return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(valor))
        return valor.slice(0, 10);
    const brMatch = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch)
        return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
    return valor;
}
function normalizarValor(bruto) {
    const limpo = bruto.replace(/[R$\s]/g, '');
    if (limpo.includes(',') && limpo.lastIndexOf(',') > limpo.lastIndexOf('.')) {
        return parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(limpo.replace(/,/g, ''));
}
function parseGenericCsv(buffer) {
    const texto = buffer.toString('utf-8');
    const registros = (0, sync_1.parse)(texto, {
        columns: (header) => header.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
        delimiter: detectarDelimitador(texto),
    });
    return registros
        .map((linha) => {
        const dataRaw = linha['data'] || linha['date'] || '';
        const descricao = linha['descricao'] || linha['descrição'] || linha['description'] || linha['title'] || '';
        const valorRaw = linha['valor'] || linha['amount'] || linha['value'] || '0';
        const categoriaTexto = linha['categoria'] || linha['category'] || null;
        return {
            data: normalizarData(dataRaw),
            descricao: descricao.trim(),
            valor: normalizarValor(valorRaw),
            categoriaTexto,
        };
    })
        .filter((item) => item.descricao);
}
//# sourceMappingURL=genericCsvParser.js.map