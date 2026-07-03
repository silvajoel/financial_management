'use strict';

const bcrypt = require('bcryptjs');
require('dotenv').config();

module.exports = {
  up: async (queryInterface) => {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const senha = process.env.ADMIN_PASSWORD || 'mude-esta-senha';
    const senhaHash = await bcrypt.hash(senha, 10);

    await queryInterface.bulkInsert('users', [
      {
        nome: 'Admin',
        email,
        senha_hash: senhaHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
