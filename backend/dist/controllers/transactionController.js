"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.transfer = transfer;
exports.generateMonth = generateMonth;
exports.summary = summary;
const models_1 = require("../models");
function parseFilters(req) {
    const { mes, ano, accountId, categoryId, status } = req.query;
    const where = {};
    if (mes)
        where.competenciaMes = Number(mes);
    if (ano)
        where.competenciaAno = Number(ano);
    if (accountId)
        where.accountId = Number(accountId);
    if (categoryId)
        where.categoryId = Number(categoryId);
    if (status)
        where.status = status;
    return where;
}
async function list(req, res) {
    const where = parseFilters(req);
    const transactions = await models_1.Transaction.findAll({
        where,
        include: [
            { model: models_1.Account, attributes: ['id', 'nome', 'instituicao', 'tipo'] },
            { model: models_1.Category, attributes: ['id', 'nome', 'tipo', 'cor'] },
        ],
        order: [
            ['competenciaAno', 'DESC'],
            ['competenciaMes', 'DESC'],
            ['dataVencimento', 'ASC'],
        ],
    });
    res.json(transactions);
}
async function create(req, res) {
    const { accountId, categoryId, descricao, valorTotal, valorPago, status, competenciaMes, competenciaAno, dataVencimento, dataPagamento, parcelaAtual, parcelaTotal, recorrente, observacao, } = req.body;
    if (!accountId || !categoryId || !descricao || valorTotal === undefined || !competenciaMes || !competenciaAno) {
        return res.status(400).json({
            error: 'accountId, categoryId, descricao, valorTotal, competenciaMes e competenciaAno são obrigatórios',
        });
    }
    const transaction = await models_1.Transaction.create({
        accountId,
        categoryId,
        descricao,
        valorTotal,
        valorPago: valorPago ?? 0,
        status: status ?? 'em_aberto',
        competenciaMes,
        competenciaAno,
        dataVencimento: dataVencimento ?? null,
        dataPagamento: dataPagamento ?? null,
        parcelaAtual: parcelaAtual ?? null,
        parcelaTotal: parcelaTotal ?? null,
        recorrente: recorrente ?? false,
        observacao: observacao ?? null,
    });
    res.status(201).json(transaction);
}
async function update(req, res) {
    const transaction = await models_1.Transaction.findByPk(req.params.id);
    if (!transaction)
        return res.status(404).json({ error: 'Lançamento não encontrado' });
    const fields = [
        'accountId',
        'categoryId',
        'descricao',
        'valorTotal',
        'valorPago',
        'status',
        'competenciaMes',
        'competenciaAno',
        'dataVencimento',
        'dataPagamento',
        'parcelaAtual',
        'parcelaTotal',
        'recorrente',
        'observacao',
    ];
    const updates = {};
    for (const field of fields) {
        if (req.body[field] !== undefined)
            updates[field] = req.body[field];
    }
    await transaction.update(updates);
    res.json(transaction);
}
async function remove(req, res) {
    const transaction = await models_1.Transaction.findByPk(req.params.id);
    if (!transaction)
        return res.status(404).json({ error: 'Lançamento não encontrado' });
    await transaction.destroy();
    res.status(204).send();
}
async function transfer(req, res) {
    const { contaOrigemId, contaDestinoId, valor, data, descricao } = req.body;
    if (!contaOrigemId || !contaDestinoId || !valor || !data) {
        return res.status(400).json({ error: 'contaOrigemId, contaDestinoId, valor e data são obrigatórios' });
    }
    if (Number(contaOrigemId) === Number(contaDestinoId)) {
        return res.status(400).json({ error: 'Conta de origem e destino não podem ser a mesma' });
    }
    const [contaOrigem, contaDestino, categoriaTransferencia] = await Promise.all([
        models_1.Account.findByPk(contaOrigemId),
        models_1.Account.findByPk(contaDestinoId),
        models_1.Category.findOne({ where: { tipo: 'transferencia' } }),
    ]);
    if (!contaOrigem || !contaDestino)
        return res.status(404).json({ error: 'Conta não encontrada' });
    if (!categoriaTransferencia) {
        return res.status(500).json({ error: "Categoria padrão de transferência não encontrada" });
    }
    const [ano, mes] = String(data).split('-').map(Number);
    const desc = descricao || `Transferência ${contaOrigem.nome} → ${contaDestino.nome}`;
    const resultado = await models_1.sequelize.transaction(async (t) => {
        const saida = await models_1.Transaction.create({
            accountId: contaOrigem.id,
            categoryId: categoriaTransferencia.id,
            descricao: `${desc} (saída)`,
            valorTotal: valor,
            valorPago: valor,
            status: 'pago',
            competenciaMes: mes,
            competenciaAno: ano,
            dataPagamento: data,
        }, { transaction: t });
        const entrada = await models_1.Transaction.create({
            accountId: contaDestino.id,
            categoryId: categoriaTransferencia.id,
            descricao: `${desc} (entrada)`,
            valorTotal: valor,
            valorPago: valor,
            status: 'pago',
            competenciaMes: mes,
            competenciaAno: ano,
            dataPagamento: data,
        }, { transaction: t });
        return { saida, entrada };
    });
    res.status(201).json(resultado);
}
async function generateMonth(req, res) {
    const mes = Number(req.body.mes);
    const ano = Number(req.body.ano);
    if (!mes || !ano)
        return res.status(400).json({ error: 'Informe mes e ano' });
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anoAnterior = mes === 1 ? ano - 1 : ano;
    const [anteriores, existentes] = await Promise.all([
        models_1.Transaction.findAll({ where: { competenciaMes: mesAnterior, competenciaAno: anoAnterior } }),
        models_1.Transaction.findAll({ where: { competenciaMes: mes, competenciaAno: ano }, attributes: ['descricao'] }),
    ]);
    const descricoesExistentes = new Set(existentes.map((t) => t.descricao));
    const criadas = [];
    for (const t of anteriores) {
        const parcelaEmAndamento = t.parcelaTotal !== null && t.parcelaAtual !== null && t.parcelaAtual < t.parcelaTotal;
        if (!t.recorrente && !parcelaEmAndamento)
            continue;
        if (descricoesExistentes.has(t.descricao))
            continue;
        let dataVencimento = null;
        if (t.dataVencimento) {
            const dia = t.dataVencimento.slice(8, 10);
            dataVencimento = `${ano}-${String(mes).padStart(2, '0')}-${dia}`;
        }
        const nova = await models_1.Transaction.create({
            accountId: t.accountId,
            categoryId: t.categoryId,
            descricao: t.descricao,
            valorTotal: t.valorTotal,
            valorPago: 0,
            status: 'em_aberto',
            competenciaMes: mes,
            competenciaAno: ano,
            dataVencimento,
            parcelaAtual: parcelaEmAndamento ? t.parcelaAtual + 1 : null,
            parcelaTotal: t.parcelaTotal,
            recorrente: t.recorrente,
            observacao: t.observacao,
        });
        criadas.push(nova);
    }
    res.status(201).json({ criadas: criadas.length, lancamentos: criadas });
}
async function summary(req, res) {
    const mes = Number(req.query.mes);
    const ano = Number(req.query.ano);
    if (!mes || !ano) {
        return res.status(400).json({ error: 'Informe mes e ano' });
    }
    const transactions = await models_1.Transaction.findAll({
        where: { competenciaMes: mes, competenciaAno: ano },
        include: [{ model: models_1.Category, attributes: ['id', 'nome', 'tipo', 'cor'] }],
    });
    let receitaTotal = 0;
    let despesaTotal = 0;
    let investimentoTotal = 0;
    const porCategoria = {};
    for (const t of transactions) {
        const valor = Number(t.valorTotal);
        const categoria = t.Category;
        const tipo = categoria?.tipo;
        if (tipo === 'receita')
            receitaTotal += valor;
        else if (tipo === 'despesa')
            despesaTotal += valor;
        else if (tipo === 'investimento')
            investimentoTotal += valor;
        if (categoria && (tipo === 'despesa' || tipo === 'investimento')) {
            const key = String(categoria.id);
            if (!porCategoria[key]) {
                porCategoria[key] = { categoryId: categoria.id, nome: categoria.nome, cor: categoria.cor, total: 0 };
            }
            porCategoria[key].total += valor;
        }
    }
    res.json({
        mes,
        ano,
        receitaTotal,
        despesaTotal,
        investimentoTotal,
        saldo: receitaTotal - despesaTotal - investimentoTotal,
        porCategoria: Object.values(porCategoria).sort((a, b) => b.total - a.total),
    });
}
//# sourceMappingURL=transactionController.js.map