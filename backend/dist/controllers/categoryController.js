"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.create = create;
exports.update = update;
exports.remove = remove;
const models_1 = require("../models");
async function list(_req, res) {
    const categories = await models_1.Category.findAll({ order: [['nome', 'ASC']] });
    res.json(categories);
}
async function create(req, res) {
    const { nome, tipo, cor } = req.body;
    if (!nome || !tipo) {
        return res.status(400).json({ error: 'nome e tipo são obrigatórios' });
    }
    const category = await models_1.Category.create({ nome, tipo, cor: cor ?? null });
    res.status(201).json(category);
}
async function update(req, res) {
    const category = await models_1.Category.findByPk(req.params.id);
    if (!category)
        return res.status(404).json({ error: 'Categoria não encontrada' });
    const { nome, tipo, cor } = req.body;
    await category.update({
        nome: nome ?? category.nome,
        tipo: tipo ?? category.tipo,
        cor: cor === undefined ? category.cor : cor,
    });
    res.json(category);
}
async function remove(req, res) {
    const category = await models_1.Category.findByPk(req.params.id);
    if (!category)
        return res.status(404).json({ error: 'Categoria não encontrada' });
    await category.destroy();
    res.status(204).send();
}
//# sourceMappingURL=categoryController.js.map