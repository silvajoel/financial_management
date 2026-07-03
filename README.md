# Gestão Financeira

Sistema web pessoal de controle financeiro: contas (Banco do Brasil, Mercado Pago, Sicoob, Nubank), lançamentos, parcelas/empréstimos, categorias e importação automática de faturas de cartão.

## Stack

- **Backend**: Node.js + Express + TypeScript + Sequelize (MySQL)
- **Frontend**: React + Vite + TypeScript
- **Banco de dados**: MySQL 8 (Docker local / MySQL do Plesk em produção)

## Estrutura

```
backend/    API REST (auth, contas, categorias, lançamentos, importação de fatura)
frontend/   Dashboard e telas (React)
docs/       Guias de setup e deploy
```

## Como rodar localmente

Veja [docs/setup.md](docs/setup.md).

## Deploy em produção (Plesk)

Veja [docs/deploy-plesk.md](docs/deploy-plesk.md).
