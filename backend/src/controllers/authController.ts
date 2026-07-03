import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';

export async function login(req: Request, res: Response) {
  const { email, senha } = req.body as { email?: string; senha?: string };

  if (!email || !senha) {
    return res.status(400).json({ error: 'Informe email e senha' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const senhaOk = await bcrypt.compare(senha, user.senhaHash);
  if (!senhaOk) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const signOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] };
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET as string, signOptions);

  return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const user = await User.findByPk(req.userId, { attributes: ['id', 'nome', 'email'] });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  return res.json(user);
}
