import { Response } from 'express';
import { Goal } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function list(_req: AuthenticatedRequest, res: Response) {
  const goals = await Goal.findAll({ order: [['dataAlvo', 'ASC']] });
  res.json(goals);
}

export async function create(req: AuthenticatedRequest, res: Response) {
  const { nome, valorAlvo, valorAtual, dataAlvo, aporteMensalPlanejado, accountId, observacao } = req.body;
  if (!nome || valorAlvo === undefined || !dataAlvo) {
    return res.status(400).json({ error: 'nome, valorAlvo e dataAlvo são obrigatórios' });
  }
  const goal = await Goal.create({
    nome,
    valorAlvo,
    valorAtual: valorAtual ?? 0,
    dataAlvo,
    aporteMensalPlanejado: aporteMensalPlanejado ?? null,
    accountId: accountId ?? null,
    observacao: observacao ?? null,
  });
  res.status(201).json(goal);
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const goal = await Goal.findByPk(req.params.id);
  if (!goal) return res.status(404).json({ error: 'Meta não encontrada' });

  const fields = ['nome', 'valorAlvo', 'valorAtual', 'dataAlvo', 'aporteMensalPlanejado', 'accountId', 'observacao'] as const;
  const updates: Record<string, unknown> = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  await goal.update(updates);
  res.json(goal);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const goal = await Goal.findByPk(req.params.id);
  if (!goal) return res.status(404).json({ error: 'Meta não encontrada' });
  await goal.destroy();
  res.status(204).send();
}
