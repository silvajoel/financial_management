import { Response } from 'express';
import { Op } from 'sequelize';
import { Transaction, Category, Account } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

function parseFilters(req: AuthenticatedRequest) {
  const { mes, ano, accountId, categoryId, status } = req.query;
  const where: Record<string, unknown> = {};
  if (mes) where.competenciaMes = Number(mes);
  if (ano) where.competenciaAno = Number(ano);
  if (accountId) where.accountId = Number(accountId);
  if (categoryId) where.categoryId = Number(categoryId);
  if (status) where.status = status;
  return where;
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const where = parseFilters(req);
  const transactions = await Transaction.findAll({
    where,
    include: [
      { model: Account, attributes: ['id', 'nome', 'instituicao', 'tipo'] },
      { model: Category, attributes: ['id', 'nome', 'tipo', 'cor'] },
    ],
    order: [
      ['competenciaAno', 'DESC'],
      ['competenciaMes', 'DESC'],
      ['dataVencimento', 'ASC'],
    ],
  });
  res.json(transactions);
}

export async function create(req: AuthenticatedRequest, res: Response) {
  const {
    accountId,
    categoryId,
    descricao,
    valorTotal,
    valorPago,
    status,
    competenciaMes,
    competenciaAno,
    dataVencimento,
    dataPagamento,
    parcelaAtual,
    parcelaTotal,
    recorrente,
    observacao,
  } = req.body;

  if (!accountId || !categoryId || !descricao || valorTotal === undefined || !competenciaMes || !competenciaAno) {
    return res.status(400).json({
      error: 'accountId, categoryId, descricao, valorTotal, competenciaMes e competenciaAno são obrigatórios',
    });
  }

  const transaction = await Transaction.create({
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

export async function update(req: AuthenticatedRequest, res: Response) {
  const transaction = await Transaction.findByPk(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Lançamento não encontrado' });

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
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await transaction.update(updates);
  res.json(transaction);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const transaction = await Transaction.findByPk(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Lançamento não encontrado' });
  await transaction.destroy();
  res.status(204).send();
}

export async function summary(req: AuthenticatedRequest, res: Response) {
  const mes = Number(req.query.mes);
  const ano = Number(req.query.ano);
  if (!mes || !ano) {
    return res.status(400).json({ error: 'Informe mes e ano' });
  }

  const transactions = await Transaction.findAll({
    where: { competenciaMes: mes, competenciaAno: ano },
    include: [{ model: Category, attributes: ['id', 'nome', 'tipo', 'cor'] }],
  });

  let receitaTotal = 0;
  let despesaTotal = 0;
  let investimentoTotal = 0;
  const porCategoria: Record<string, { categoryId: number; nome: string; cor: string | null; total: number }> = {};

  for (const t of transactions) {
    const valor = Number(t.valorTotal);
    const categoria = (t as any).Category as { id: number; nome: string; tipo: string; cor: string | null } | undefined;
    const tipo = categoria?.tipo;

    if (tipo === 'receita') receitaTotal += valor;
    else if (tipo === 'despesa') despesaTotal += valor;
    else if (tipo === 'investimento') investimentoTotal += valor;

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
