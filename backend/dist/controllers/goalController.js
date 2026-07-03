"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
const models_1 = require("../models");
async function list(_req, res) {
    const goals = await models_1.Goal.findAll({ order: [['dataAlvo', 'ASC']] });
    res.json(goals);
}
async function create(req, res) {
    const { nome, valorAlvo, valorAtual, dataAlvo, aporteMensalPlanejado, accountId, observacao } = req.body;
    if (!nome || valorAlvo === undefined || !dataAlvo) {
        return res.status(400).json({ error: 'nome, valorAlvo e dataAlvo são obrigatórios' });
    }
    const goal = await models_1.Goal.create({
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
async function update(req, res) {
    const goal = await models_1.Goal.findByPk(req.params.id);
    if (!goal)
        return res.status(404).json({ error: 'Meta não encontrada' });
    const fields = ['nome', 'valorAlvo', 'valorAtual', 'dataAlvo', 'aporteMensalPlanejado', 'accountId', 'observacao'];
    const updates = {};
    for (const field of fields) {
        if (req.body[field] !== undefined)
            updates[field] = req.body[field];
    }
    await goal.update(updates);
    res.json(goal);
}
async function remove(req, res) {
    const goal = await models_1.Goal.findByPk(req.params.id);
    if (!goal)
        return res.status(404).json({ error: 'Meta não encontrada' });
    await goal.destroy();
    res.status(204).send();
}
//# sourceMappingURL=goalController.js.map