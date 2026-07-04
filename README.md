# Gestão Financeira

Sistema web pessoal de controle financeiro: contas (Banco do Brasil, Mercado Pago, Sicoob, Nubank), lançamentos, parcelas/empréstimos, categorias, metas financeiras e importação automática de faturas de cartão.

## Funcionalidades

- **Contas**: Banco do Brasil (crédito/conta corrente), Mercado Pago (conta corrente/investimentos/cofrinho), Sicoob (empréstimo), Nubank (crédito/conta corrente), com saldo e limite editáveis
- **Lançamentos**: receitas, despesas, parcelas e contas recorrentes, com status (pago/parcial/em aberto/liquidado) e competência mensal
- **Importação de fatura de cartão**: upload de PDF (parser dedicado para Banco do Brasil) ou CSV (formato genérico e Nubank), com extração automática, categorização sugerida e tela de revisão antes de confirmar
- **Metas financeiras**: valor alvo, prazo, aporte mensal planejado, vinculadas a uma conta
- **Dashboard**: resumo do mês, evolução do saldo, despesas por categoria, progresso de metas e parcelas ativas

## Stack

- **Backend**: Node.js + Express + TypeScript + Sequelize (MySQL) — compatível com Node 17 (ambiente de produção no Plesk)
- **Frontend**: React + Vite + TypeScript + React Query + Recharts
- **Banco de dados**: MySQL 8 (Docker local / MySQL do Plesk em produção)

## Estrutura

```
backend/    API REST (auth, contas, categorias, lançamentos, metas, importação de fatura)
frontend/   Dashboard e telas (React)
docs/       Guias de setup e deploy
```

## Como rodar localmente

Veja [docs/setup.md](docs/setup.md).

## Deploy em produção (Plesk)

Veja [docs/deploy-plesk.md](docs/deploy-plesk.md).

## Privacidade

Este repositório é público. O seed do banco contém apenas estrutura (contas, categorias, regras de categorização) — nenhum dado financeiro real. Lançamentos, saldos e metas reais existem apenas no banco de dados local/produção, nunca no código.
