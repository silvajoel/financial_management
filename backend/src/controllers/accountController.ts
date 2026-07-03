import { Response } from 'express';
import { Account } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function list(_req: AuthenticatedRequest, res: Response) {
  const accounts = await Account.findAll({ order: [['id', 'ASC']] });
  res.json(accounts);
}

export async function create(req: AuthenticatedRequest, res: Response) {
  const { nome, instituicao, tipo, limite, saldo } = req.body;
  if (!nome || !instituicao || !tipo) {
    return res.status(400).json({ error: 'nome, instituicao e tipo são obrigatórios' });
  }
  const account = await Account.create({
    nome,
    instituicao,
    tipo,
    limite: limite ?? null,
    saldo: saldo ?? 0,
    ativa: true,
  });
  res.status(201).json(account);
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const account = await Account.findByPk(req.params.id);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });

  const { nome, instituicao, tipo, limite, saldo, ativa } = req.body;
  await account.update({
    nome: nome ?? account.nome,
    instituicao: instituicao ?? account.instituicao,
    tipo: tipo ?? account.tipo,
    limite: limite === undefined ? account.limite : limite,
    saldo: saldo === undefined ? account.saldo : saldo,
    ativa: ativa === undefined ? account.ativa : ativa,
  });
  res.json(account);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const account = await Account.findByPk(req.params.id);
  if (!account) return res.status(404).json({ error: 'Conta não encontrada' });
  await account.update({ ativa: false });
  res.status(204).send();
}
