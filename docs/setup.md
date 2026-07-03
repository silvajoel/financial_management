# Setup local

## Pré-requisitos

- Node.js 18+ (dev local; produção usa Node 17 no Plesk, veja `deploy-plesk.md`)
- Docker Desktop (para o MySQL local)

## 1. Subir o banco de dados

```bash
docker compose up -d
```

Isso sobe um MySQL 8 em `localhost:3306` com banco `financeiro`, usuário `financeiro` / senha `financeiro123`.

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

API sobe em `http://localhost:3001`. O seed cria:
- 1 usuário admin — login/senha vêm de `ADMIN_EMAIL`/`ADMIN_PASSWORD` no `.env` (troque antes de rodar em produção)
- As contas: Banco do Brasil (débito e crédito), Mercado Pago (débito, investimentos e cofrinho), Sicoob (empréstimo), Nubank (débito e crédito)
- Categorias-base: Conta de Luz, Água, Aluguel, Cartão de Crédito, Trabalhos Freelancer, Investimentos, Telefone, Hosting, entre outras, além de regras de categorização automática para a importação de fatura

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Importação de fatura

Na tela "Importar Fatura", envie o PDF (Banco do Brasil) ou CSV (formato genérico `data,descricao,valor[,categoria]`) da fatura do cartão. O sistema extrai os lançamentos, sugere categorias e mostra uma tela de revisão — nada é gravado até você confirmar.

O parser do Nubank ainda é best-effort (sem amostra real calibrada). Se a extração vier incompleta, use a opção de importar CSV genérico exportado do app do Nubank, ou ajuste manualmente na tela de revisão.

## Saldos, metas e lançamentos reais

O seed só cria estrutura (contas, categorias, regras). Saldos reais, metas financeiras e lançamentos do dia a dia são cadastrados por você direto na aplicação (telas Contas, Lançamentos e, futuramente, uma tela de Metas — hoje via API `POST /api/goals`) e ficam só no banco de dados, nunca no git.
