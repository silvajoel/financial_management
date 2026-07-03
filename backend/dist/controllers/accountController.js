"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
const models_1 = require("../models");
async function list(_req, res) {
    const accounts = await models_1.Account.findAll({ order: [['id', 'ASC']] });
    res.json(accounts);
}
async function create(req, res) {
    const { nome, instituicao, tipo, limite, saldo, bandeira, ultimosDigitos } = req.body;
    if (!nome || !instituicao || !tipo) {
        return res.status(400).json({ error: 'nome, instituicao e tipo são obrigatórios' });
    }
    const account = await models_1.Account.create({
        nome,
        instituicao,
        tipo,
        limite: limite ?? null,
        saldo: saldo ?? 0,
        bandeira: bandeira ?? null,
        ultimosDigitos: ultimosDigitos ?? null,
        ativa: true,
    });
    res.status(201).json(account);
}
async function update(req, res) {
    const account = await models_1.Account.findByPk(req.params.id);
    if (!account)
        return res.status(404).json({ error: 'Conta não encontrada' });
    const { nome, instituicao, tipo, limite, saldo, bandeira, ultimosDigitos, ativa } = req.body;
    await account.update({
        nome: nome ?? account.nome,
        instituicao: instituicao ?? account.instituicao,
        tipo: tipo ?? account.tipo,
        limite: limite === undefined ? account.limite : limite,
        saldo: saldo === undefined ? account.saldo : saldo,
        bandeira: bandeira === undefined ? account.bandeira : bandeira,
        ultimosDigitos: ultimosDigitos === undefined ? account.ultimosDigitos : ultimosDigitos,
        ativa: ativa === undefined ? account.ativa : ativa,
    });
    res.json(account);
}
async function remove(req, res) {
    const account = await models_1.Account.findByPk(req.params.id);
    if (!account)
        return res.status(404).json({ error: 'Conta não encontrada' });
    await account.update({ ativa: false });
    res.status(204).send();
}
//# sourceMappingURL=accountController.js.map