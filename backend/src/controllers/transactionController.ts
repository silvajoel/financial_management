import { Response } from 'express';
import { Transaction, Category, Account, sequelize } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

// Efeito de um lançamento pago sobre o saldo da conta: receita soma, despesa/
// investimento subtrai. Transferência usa o próprio sinal do valor (a perna de
// saída é gravada negativa), então o mesmo cálculo serve para criar/reverter.
async function efeitoNoSaldo(t: Transaction): Promise<number> {
  if (t.status !== 'pago') return 0;
  const categoria = await Category.findByPk(t.categoryId);
  if (!categoria) return 0;
  const valor = Number(t.valorTotal);
  if (categoria.tipo === 'receita') return valor;
  if (categoria.tipo === 'despesa' || categoria.tipo === 'investimento') return -valor;
  return valor;
}

async function aplicarNoSaldo(accountId: number, delta: number) {
  if (!delta) return;
  await Account.increment('saldo', { by: delta, where: { id: accountId } });
}

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

  await aplicarNoSaldo(transaction.accountId, await efeitoNoSaldo(transaction));

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

  // Marcou como pago sem informar valor pago/data: assume quitação integral hoje.
  if (updates.status === 'pago') {
    if (updates.valorPago === undefined && Number(transaction.valorPago) === 0) {
      updates.valorPago = transaction.valorTotal;
    }
    if (updates.dataPagamento === undefined && !transaction.dataPagamento) {
      updates.dataPagamento = new Date().toISOString().slice(0, 10);
    }
  }

  const efeitoAntes = await efeitoNoSaldo(transaction);
  const contaAntes = transaction.accountId;

  await transaction.update(updates);

  const efeitoDepois = await efeitoNoSaldo(transaction);
  if (contaAntes === transaction.accountId) {
    await aplicarNoSaldo(contaAntes, efeitoDepois - efeitoAntes);
  } else {
    await aplicarNoSaldo(contaAntes, -efeitoAntes);
    await aplicarNoSaldo(transaction.accountId, efeitoDepois);
  }

  res.json(transaction);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const transaction = await Transaction.findByPk(req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Lançamento não encontrado' });
  await aplicarNoSaldo(transaction.accountId, -(await efeitoNoSaldo(transaction)));
  await transaction.destroy();
  res.status(204).send();
}

export async function transfer(req: AuthenticatedRequest, res: Response) {
  const { contaOrigemId, contaDestinoId, valor, data, descricao } = req.body;

  if (!contaOrigemId || !contaDestinoId || !valor || !data) {
    return res.status(400).json({ error: 'contaOrigemId, contaDestinoId, valor e data são obrigatórios' });
  }
  if (Number(contaOrigemId) === Number(contaDestinoId)) {
    return res.status(400).json({ error: 'Conta de origem e destino não podem ser a mesma' });
  }

  const [contaOrigem, contaDestino, categoriaTransferencia] = await Promise.all([
    Account.findByPk(contaOrigemId),
    Account.findByPk(contaDestinoId),
    Category.findOne({ where: { tipo: 'transferencia' } }),
  ]);

  if (!contaOrigem || !contaDestino) return res.status(404).json({ error: 'Conta não encontrada' });
  if (!categoriaTransferencia) {
    return res.status(500).json({ error: "Categoria padrão de transferência não encontrada" });
  }

  const [ano, mes] = String(data).split('-').map(Number);
  const desc = descricao || `Transferência ${contaOrigem.nome} → ${contaDestino.nome}`;

  const resultado = await sequelize.transaction(async (t) => {
    // A perna de saída é gravada com valor negativo: o sinal carrega a direção,
    // o que mantém efeitoNoSaldo consistente se o lançamento for editado/removido.
    const saida = await Transaction.create(
      {
        accountId: contaOrigem.id,
        categoryId: categoriaTransferencia.id,
        descricao: `${desc} (saída)`,
        valorTotal: -valor,
        valorPago: -valor,
        status: 'pago',
        competenciaMes: mes,
        competenciaAno: ano,
        dataPagamento: data,
      },
      { transaction: t },
    );
    const entrada = await Transaction.create(
      {
        accountId: contaDestino.id,
        categoryId: categoriaTransferencia.id,
        descricao: `${desc} (entrada)`,
        valorTotal: valor,
        valorPago: valor,
        status: 'pago',
        competenciaMes: mes,
        competenciaAno: ano,
        dataPagamento: data,
      },
      { transaction: t },
    );
    await Account.increment('saldo', { by: -valor, where: { id: contaOrigem.id }, transaction: t });
    await Account.increment('saldo', { by: valor, where: { id: contaDestino.id }, transaction: t });
    return { saida, entrada };
  });

  res.status(201).json(resultado);
}

export async function generateMonth(req: AuthenticatedRequest, res: Response) {
  const mes = Number(req.body.mes);
  const ano = Number(req.body.ano);
  const ids: number[] | undefined = Array.isArray(req.body.ids) ? req.body.ids.map(Number) : undefined;
  if (!mes || !ano) return res.status(400).json({ error: 'Informe mes e ano' });

  const mesAnterior = mes === 1 ? 12 : mes - 1;
  const anoAnterior = mes === 1 ? ano - 1 : ano;

  const [anteriores, existentes] = await Promise.all([
    Transaction.findAll({ where: { competenciaMes: mesAnterior, competenciaAno: anoAnterior } }),
    Transaction.findAll({ where: { competenciaMes: mes, competenciaAno: ano }, attributes: ['descricao'] }),
  ]);

  const descricoesExistentes = new Set(existentes.map((t) => t.descricao));
  const criadas: Transaction[] = [];

  for (const t of anteriores) {
    const parcelaEmAndamento = t.parcelaTotal !== null && t.parcelaAtual !== null && t.parcelaAtual < t.parcelaTotal;
    if (!t.recorrente && !parcelaEmAndamento) continue;
    if (descricoesExistentes.has(t.descricao)) continue;
    if (ids && !ids.includes(t.id)) continue;

    let dataVencimento: string | null = null;
    if (t.dataVencimento) {
      const dia = t.dataVencimento.slice(8, 10);
      dataVencimento = `${ano}-${String(mes).padStart(2, '0')}-${dia}`;
    }

    const nova = await Transaction.create({
      accountId: t.accountId,
      categoryId: t.categoryId,
      descricao: t.descricao,
      valorTotal: t.valorTotal,
      valorPago: 0,
      status: 'em_aberto',
      competenciaMes: mes,
      competenciaAno: ano,
      dataVencimento,
      parcelaAtual: parcelaEmAndamento ? (t.parcelaAtual as number) + 1 : null,
      parcelaTotal: t.parcelaTotal,
      recorrente: t.recorrente,
      observacao: t.observacao,
    });
    criadas.push(nova);
  }

  res.status(201).json({ criadas: criadas.length, lancamentos: criadas });
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
