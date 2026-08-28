# Como iniciar a aplicação

Guia para rodar o projeto localmente em desenvolvimento. O repositório é um monorepo com duas aplicações e um banco Postgres gerenciado:

| App | Stack | Porta padrão |
|-----|-------|--------------|
| **API** (`apps/api`) | Fastify + Prisma + PostgreSQL (Supabase) | `3333` |
| **Web** (`apps/web`) | React + Vite | `5173` |
| **BD** | Supabase free (Postgres) | — |

Fluxo de dados: **FE → BE → BD** (o front-end não fala com o Supabase diretamente).

---

## Pré-requisitos

- **Node.js** 20+ (testado com v22)
- **npm** 10+
- Conta **Supabase free** com um projeto criado
- **Docker** (opcional — só se preferir Postgres local em vez do Supabase)

---

## 1. Instalar dependências

Na raiz do repositório:

```bash
npm install
```

O projeto usa npm workspaces (`apps/*` e `packages/*`). Um único `npm install` na raiz instala tudo.

---

## 2. Configurar variáveis de ambiente

Copie os arquivos de exemplo para `.env` em cada app:

**Windows (PowerShell):**

```powershell
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env
```

**macOS / Linux:**

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### API (`apps/api/.env`) — Supabase

1. No dashboard do Supabase, clique em **Connect**.
2. Copie a connection string do **Session pooler** (porta `5432`).
3. Cole em `DATABASE_URL` (inclua `?sslmode=require`).
4. Se `prisma migrate` falhar com o pooler, copie também a **Direct connection** para `DIRECT_URL`.

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Session pooler do Supabase (runtime + migrations por padrão) |
| `DIRECT_URL` | Opcional — Direct connection para migrations |
| `PORT` | Porta da API (`3333`) |
| `WEB_ORIGIN` | Origem CORS do Vite (`http://localhost:5173`) |

Exemplo (valores fictícios):

```env
DATABASE_URL="postgresql://postgres.abcdefgh:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
# DIRECT_URL="postgresql://postgres:SUA_SENHA@db.abcdefgh.supabase.co:5432/postgres?sslmode=require"
PORT=3333
WEB_ORIGIN="http://localhost:5173"
```

Nunca commite o arquivo `.env` com a senha real.

### Web (`apps/web/.env`)

| Variável | Valor padrão | Descrição |
|----------|--------------|-----------|
| `VITE_API_URL` | `http://localhost:3333` | URL base da API consumida pelo front-end |

### Alternativa: Postgres local (Docker)

Se não usar Supabase no momento:

```bash
docker compose up -d
```

E em `apps/api/.env`:

```env
DATABASE_URL="postgresql://finance:finance@localhost:5432/finance?schema=public"
```

---

## 3. Aplicar migrations (primeira vez)

Com `DATABASE_URL` apontando para o Supabase (ou Docker):

```bash
npm run db:migrate
```

Isso executa `prisma migrate deploy` e cria as tabelas (`Project`, `Category`, `Transaction`, `Goal`, `UpcomingPayment`) no banco.

Para criar **novas** migrations durante o desenvolvimento:

```bash
npm run db:migrate:dev
```

### Dados iniciais (opcional)

O seed popula exemplos de junho/2026. Para dados reais, **não rode o seed** — use a página **Transações** no FE.

```bash
npm run db:seed
```

---

## 4. Iniciar API e Web

Use **dois terminais** na raiz do repositório.

**Terminal 1 — API:**

```bash
npm run dev:api
```

**Terminal 2 — Web:**

```bash
npm run dev:web
```

### O que acontece ao rodar `dev`

| Comando | Passos automáticos (`predev`) | Servidor |
|---------|-------------------------------|----------|
| `npm run dev:api` | Build do `@finance/shared` + `prisma generate` | `tsx watch` na porta **3333** |
| `npm run dev:web` | Build do `@finance/shared` | Vite na porta **5173** |

---

## 5. Acessar a aplicação

| Recurso | URL |
|---------|-----|
| Front-end | http://localhost:5173 |
| Transações (criar dados reais) | http://localhost:5173/transacoes |
| API | http://localhost:3333 |
| Health check | http://localhost:3333/health |

Resposta esperada do health check:

```json
{ "status": "ok" }
```

### Fluxo recomendado com dados reais

1. Abra **Transações** → **Nova Transaction**.
2. Salve — o FE chama `POST /transactions` → Prisma grava no Supabase.
3. Confira a linha no **Table Editor** do Supabase (`Transaction`).
4. Abra o **Dashboard** — `GET /dashboard` agrega as transactions do BD.

---

## Scripts úteis (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev:api` | API em modo desenvolvimento |
| `npm run dev:web` | Web em modo desenvolvimento |
| `npm run build` | Build de shared, API e web |
| `npm run lint` | Lint em todos os workspaces |
| `npm run db:migrate` | Aplica migrations pendentes (`migrate deploy`) |
| `npm run db:migrate:dev` | Cria/aplica migrations em desenvolvimento |
| `npm run db:seed` | Seed do banco (opcional) |
| `npm run db:generate` | Regenera o Prisma Client |

---

## Build de produção

```bash
npm run build
```

Para rodar a API compilada:

```bash
npm run start -w @finance/api
```

Para pré-visualizar o front-end compilado:

```bash
npm run preview:web
```

---

## Problemas comuns

### API não conecta ao banco

- Confirme `DATABASE_URL` no `apps/api/.env` (Session pooler + `sslmode=require`)
- Se migrations falharem, defina `DIRECT_URL` com a Direct connection do Supabase
- Rode `npm run db:migrate` se o banco ainda não tiver as tabelas
- No free tier, projetos pausados precisam ser reativados no dashboard

### Porta já em uso

- API: altere `PORT` em `apps/api/.env`
- Web: use `npm run dev:web -- --port 5174` (ou outra porta livre)
- Se mudar a porta da API, atualize `VITE_API_URL` em `apps/web/.env`

### Front-end não encontra a API

- Confirme que a API está rodando (`npm run dev:api`)
- Verifique se `VITE_API_URL` corresponde à porta real da API
- Reinicie o Vite após alterar variáveis `VITE_*`
- Erros de rede agora **aparecem na UI** (não há mais fallback silencioso para mocks)

### Erro no Prisma Client

```bash
npm run db:generate
```

---

## Estrutura resumida

```
finance/
├── apps/
│   ├── api/          # Back-end (Fastify + Prisma)
│   └── web/          # Front-end (React + Vite)
├── packages/
│   └── shared/       # Tipos e schemas Zod compartilhados
├── docker-compose.yml  # Postgres local (opcional)
└── package.json      # Scripts do monorepo
```
