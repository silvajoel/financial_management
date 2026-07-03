# Deploy no Plesk

Guia manual de deploy (não executado por automação — envolve credenciais do painel de hospedagem). Assume um plano Plesk com suporte a Node.js (Node 17) e MySQL, como `hostclt03.mgconecta.com.br`.

## 1. Banco de dados

1. No Plesk, crie um banco MySQL (ex.: `financeiro`) e um usuário com todas as permissões nesse banco.
2. Anote host, porta (geralmente 3306), nome do banco, usuário e senha.

## 2. Backend (API Node)

1. No Plesk, crie um domínio/subdomínio (ex.: `api.seudominio.com.br`) e ative "Node.js" para ele, selecionando a versão 17.
2. Defina o **document root** apontando para `backend/dist` (após o build) e o **application startup file** como `server.js`.
3. Faça upload do conteúdo de `backend/` (ou configure deploy via Git, se o plano suportar) para a pasta da aplicação.
4. Rode localmente (ou via terminal SSH do Plesk, se disponível):
   ```bash
   cd backend
   npm install --omit=dev
   npm run build        # gera backend/dist a partir do TypeScript
   ```
5. Configure as variáveis de ambiente no painel Node.js do Plesk (ou em um arquivo `.env` na pasta da app, nunca commitado):
   ```
   NODE_ENV=production
   PORT=<porta que o Plesk atribuir>
   DB_HOST=<host do MySQL>
   DB_PORT=3306
   DB_NAME=financeiro
   DB_USER=<usuário>
   DB_PASSWORD="<senha>"
   JWT_SECRET=<segredo forte gerado só para produção>
   JWT_EXPIRES_IN=7d
   ADMIN_EMAIL=<seu email>
   ADMIN_PASSWORD=<senha forte só de uso único no seed>
   CORS_ORIGIN=https://<domínio do frontend>
   ```
   > Se a senha do banco tiver `#`, coloque entre aspas — sem aspas o dotenv corta o valor
   > ali, tratando o resto como comentário (isso já causou um "access denied" real aqui).
6. Rode as migrations e o seed contra o banco de produção (via terminal do Plesk ou SSH):
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all   # só na primeira vez
   ```
7. Reinicie a aplicação Node pelo painel do Plesk.
8. **Troque a senha do usuário admin** (via `ADMIN_PASSWORD` só vale no primeiro seed) assim que logar pela primeira vez — não há tela de "trocar senha" ainda; se precisar, gere um novo hash com bcrypt e atualize direto no banco, ou peça para adicionarmos essa tela.

## 3. Frontend (build estático)

1. Localmente, configure `frontend/.env` com `VITE_API_URL=https://api.seudominio.com.br/api` e rode:
   ```bash
   cd frontend
   npm install
   npm run build   # gera frontend/dist
   ```
2. Suba o conteúdo de `frontend/dist` para o document root do domínio principal (ex.: `seudominio.com.br`), servido como site estático pelo Plesk (Apache/Nginx).
3. Como é uma SPA, garanta um fallback de rotas: no Plesk, em "Configurações adicionais do Nginx" (ou `.htaccess` se for Apache), redirecione 404s para `index.html`:
   ```nginx
   location / {
     try_files $uri /index.html;
   }
   ```

## 4. Atualizações futuras

A cada nova versão:
```bash
git pull
cd backend && npm install --omit=dev && npm run build && npx sequelize-cli db:migrate
cd ../frontend && npm install && npm run build
```
Depois reiniciar a aplicação Node pelo painel do Plesk e re-enviar `frontend/dist`.

## Notas de segurança

- Nunca commitar `.env` — apenas `.env.example` vai para o git.
- `JWT_SECRET` de produção deve ser diferente do usado em desenvolvimento.
- O upload de fatura (PDF/CSV) é processado em memória e nunca gravado em disco no servidor.
