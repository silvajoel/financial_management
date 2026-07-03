"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
async function login(req, res) {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Informe email e senha' });
    }
    const user = await models_1.User.findOne({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const senhaOk = await bcryptjs_1.default.compare(senha, user.senhaHash);
    if (!senhaOk) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const signOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') };
    const token = jsonwebtoken_1.default.sign({ sub: user.id }, process.env.JWT_SECRET, signOptions);
    return res.json({ token, user: { id: user.id, nome: user.nome, email: user.email } });
}
async function me(req, res) {
    const user = await models_1.User.findByPk(req.userId, { attributes: ['id', 'nome', 'email'] });
    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.json(user);
}
//# sourceMappingURL=authController.js.map