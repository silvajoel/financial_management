"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preview = preview;
exports.confirm = confirm;
exports.updateItem = updateItem;
exports.list = list;
const models_1 = require("../models");
const bbPdfParser_1 = require("../services/invoiceParsers/bbPdfParser");
const nubankParser_1 = require("../services/invoiceParsers/nubankParser");
const genericCsvParser_1 = require("../services/invoiceParsers/genericCsvParser");
const categorySuggestion_1 = require("../services/categorySuggestion");
function extensao(nomeArquivo) {
    const partes = nomeArquivo.split('.');
    return partes.length > 1 ? partes[partes.length - 1].toLowerCase() : '';
}
// "JOEL SILVA CAMPOS C" -> "Joel": o primeiro nome do portador é o default
// de responsável na divisão da fatura.
function primeiroNome(portador) {
    if (!portador)
        return null;
    const primeiro = portador.trim().split(/\s+/)[0];
    if (!primeiro)
        return null;
    return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
}
async function preview(req, res) {
    const { accountId } = req.body;
    if (!accountId)
        return res.status(400).json({ error: 'accountId é obrigatório' });
    if (!req.file)
        return res.status(400).json({ error: 'Arquivo da fatura não enviado' });
    const account = await models_1.Account.findByPk(Number(accountId));
    if (!account)
        return res.status(404).json({ error: 'Conta não encontrada' });
    const ext = extensao(req.file.originalname);
    let itens = [];
    let valorTotalFatura = null;
    let saldoFaturaAnterior = null;
    let dataVencimento = null;
    let dataFechamento = null;
    try {
        if (ext === 'pdf' && account.instituicao === 'banco_do_brasil') {
            const parsed = await (0, bbPdfParser_1.parseBBInvoicePdf)(req.file.buffer);
            itens = parsed.itens;
            valorTotalFatura = parsed.valorTotal;
            saldoFaturaAnterior = parsed.saldoFaturaAnterior;
            dataVencimento = parsed.dataVencimento;
            dataFechamento = parsed.dataFechamento;
        }
        else if (ext === 'pdf' && account.instituicao === 'nubank') {
            itens = await (0, nubankParser_1.parseNubankPdfBestEffort)(req.file.buffer);
        }
        else if (ext === 'csv' && account.instituicao === 'nubank') {
            itens = (0, nubankParser_1.parseNubankCsv)(req.file.buffer);
        }
        else if (ext === 'csv') {
            itens = (0, genericCsvParser_1.parseGenericCsv)(req.file.buffer).map((item) => ({
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
        else {
            return res.status(400).json({ error: `Combinação de instituição (${account.instituicao}) e arquivo (.${ext}) não suportada` });
        }
    }
    catch (error) {
        return res.status(422).json({ error: 'Não foi possível ler o arquivo enviado', detalhe: error.message });
    }
    const categorias = await models_1.Category.findAll();
    const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c.nome]));
    const itensComSugestao = await Promise.all(itens.map(async (item) => {
        const categoryId = await (0, categorySuggestion_1.suggestCategoryId)(item.descricao, item.secaoBB);
        return {
            ...item,
            categoryId,
            categoryNome: categoryId ? categoriaPorId[categoryId] : null,
        };
    }));
    const somaItens = itensComSugestao.reduce((acc, i) => acc + i.valor, 0);
    res.json({
        accountId: account.id,
        valorTotalFatura,
        saldoFaturaAnterior,
        dataVencimento,
        dataFechamento,
        somaItens: Number(somaItens.toFixed(2)),
        itens: itensComSugestao,
    });
}
async function confirm(req, res) {
    const { accountId, competenciaMes, competenciaAno, dataFechamento, dataVencimento, itens, valorTotal } = req.body;
    if (!accountId || !competenciaMes || !competenciaAno || !Array.isArray(itens)) {
        return res.status(400).json({ error: 'accountId, competenciaMes, competenciaAno e itens são obrigatórios' });
    }
    const account = await models_1.Account.findByPk(accountId);
    if (!account)
        return res.status(404).json({ error: 'Conta não encontrada' });
    const categoriaCartao = await models_1.Category.findOne({ where: { nome: 'Cartão de Crédito' } });
    if (!categoriaCartao) {
        return res.status(500).json({ error: "Categoria padrão 'Cartão de Crédito' não encontrada" });
    }
    const somaItens = itens.reduce((acc, i) => acc + Number(i.valor), 0);
    const valorFinal = valorTotal !== undefined ? Number(valorTotal) : somaItens;
    const transaction = await models_1.Transaction.create({
        accountId,
        categoryId: categoriaCartao.id,
        descricao: `Fatura ${String(competenciaMes).padStart(2, '0')}/${competenciaAno} - ${account.nome}`,
        valorTotal: valorFinal,
        valorPago: 0,
        status: 'em_aberto',
        competenciaMes,
        competenciaAno,
        dataVencimento: dataVencimento ?? null,
        origem: 'import_fatura',
    });
    const cardInvoice = await models_1.CardInvoice.create({
        accountId,
        competenciaMes,
        competenciaAno,
        valorTotal: valorFinal,
        dataFechamento: dataFechamento ?? null,
        dataVencimento: dataVencimento ?? null,
        transactionId: transaction.id,
    });
    await models_1.CardInvoiceItem.bulkCreate(itens.map((item) => ({
        cardInvoiceId: cardInvoice.id,
        data: item.data,
        descricao: item.descricao,
        pais: item.pais ?? null,
        valor: item.valor,
        categoryId: item.categoryId ?? null,
        portador: item.portador ?? null,
        responsavel: item.responsavel ?? primeiroNome(item.portador ?? null),
        parcelaAtual: item.parcelaAtual ?? null,
        parcelaTotal: item.parcelaTotal ?? null,
    })));
    const itensCriados = await models_1.CardInvoiceItem.findAll({ where: { cardInvoiceId: cardInvoice.id } });
    res.status(201).json({ cardInvoice, transaction, itens: itensCriados });
}
async function updateItem(req, res) {
    const item = await models_1.CardInvoiceItem.findByPk(req.params.id);
    if (!item)
        return res.status(404).json({ error: 'Item não encontrado' });
    const { responsavel, categoryId, descricao, valor } = req.body;
    await item.update({
        responsavel: responsavel === undefined ? item.responsavel : responsavel,
        categoryId: categoryId === undefined ? item.categoryId : categoryId,
        descricao: descricao === undefined ? item.descricao : descricao,
        valor: valor === undefined ? item.valor : valor,
    });
    res.json(item);
}
async function list(req, res) {
    const { accountId } = req.query;
    const where = {};
    if (accountId)
        where.accountId = Number(accountId);
    const invoices = await models_1.CardInvoice.findAll({
        where,
        include: [
            { model: models_1.Account, attributes: ['id', 'nome', 'instituicao'] },
            { model: models_1.CardInvoiceItem, as: 'itens' },
        ],
        order: [
            ['competenciaAno', 'DESC'],
            ['competenciaMes', 'DESC'],
        ],
    });
    res.json(invoices);
}
//# sourceMappingURL=invoiceController.js.map