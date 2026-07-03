import { Response } from 'express';
import { Category } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function list(_req: AuthenticatedRequest, res: Response) {
  const categories = await Category.findAll({ order: [['nome', 'ASC']] });
  res.json(categories);
}

export async function create(req: AuthenticatedRequest, res: Response) {
  const { nome, tipo, cor } = req.body;
  if (!nome || !tipo) {
    return res.status(400).json({ error: 'nome e tipo são obrigatórios' });
  }
  const category = await Category.create({ nome, tipo, cor: cor ?? null });
  res.status(201).json(category);
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });

  const { nome, tipo, cor } = req.body;
  await category.update({
    nome: nome ?? category.nome,
    tipo: tipo ?? category.tipo,
    cor: cor === undefined ? category.cor : cor,
  });
  res.json(category);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
  await category.destroy();
  res.status(204).send();
}
