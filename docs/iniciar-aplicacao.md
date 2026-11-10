# Como iniciar a aplicação

Guia para rodar o projeto localmente em desenvolvimento. O repositório é um monorepo com duas aplicações. Os dados ficam em Markdown na pasta `data/`, sem banco externo.

| App | Stack | Porta padrão |
|-----|-------|--------------|
| **API** (`apps/api`) | Java 21 + Spring Boot + arquivos Markdown | `3333` |
| **Web** (`apps/web`) | React + Vite | `5173` |
| **Dados** | `data/*.md` na raiz do repositório | — |

Fluxo de dados: **FE → API → Markdown**. O front-end não lê os arquivos direto.

Os Markdown de dados reais são ignorados pelo Git. O formato está em `data/finance.example.md`.

---

## Pré-requisitos

- **JDK** 21+ (testado com 22). O comando `java` precisa estar no `PATH` ou a variável `JAVA_HOME` precisa estar definida.
- **Node.js** 20+ (testado com v22)
- **npm** 10+

Não é preciso instalar o Maven. A API usa o Maven Wrapper (`apps/api/mvnw` e `mvnw.cmd`), que baixa a versão certa na primeira execução.

---

## 1. Instalar dependências

Na raiz do repositório:

```bash
npm install
```

O projeto usa npm workspaces (`apps/web` e `packages/*`). Um único `npm install` na raiz instala as dependências do front-end. As dependências da API são baixadas pelo Maven na primeira execução de `npm run dev:api`.

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

### API (`apps/api/.env`)

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta da API (`3333`) |
| `WEB_ORIGIN` | Origem CORS do Vite (`http://localhost:5173`) |
| `DATA_DIR` | Opcional. Pasta dos Markdown. Padrão: `data/` na raiz do repositório |

A API lê o `.env` da pasta onde é iniciada (`apps/api`). Os scripts da raiz já rodam a API nessa pasta. Variáveis de ambiente do sistema têm prioridade sobre o `.env`.

Não é preciso configurar banco. A API cria os arquivos na primeira consulta.

### Web (`apps/web/.env`)

| Variável | Valor padrão | Descrição |
|----------|--------------|-----------|
| `VITE_API_URL` | `http://localhost:3333` | URL base da API consumida pelo front-end |

---

## 3. Dados

Não há migration nem seed. Ao abrir o dashboard, a API cria em `data/`:

- `categories.md`
- `accounts.md`
- `projects.md`
- `transactions.md`
- `goals.md`
- `upcoming-payments.md`

Esses arquivos começam com uma lista vazia. Cadastre income, expense e projects pela interface.

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

| Comando | Passos automáticos | Servidor |
|---------|--------------------|----------|
| `npm run dev:api` | Maven Wrapper compila a API (`spring-boot:run`) | Spring Boot na porta **3333** |
| `npm run dev:web` | Build do `@finance/shared` (`predev`) | Vite na porta **5173** |

A primeira execução de `dev:api` demora mais porque o Maven baixa as dependências. Com o Spring Boot DevTools, a API reinicia sozinha quando as classes são recompiladas pela IDE.

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
2. Salve — o FE chama `POST /transactions` e a API grava em `data/transactions.md`.
3. Abra o **Dashboard** — `GET /dashboard` agrega as transactions desses arquivos.

---

## Scripts úteis (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev:api` | API em modo desenvolvimento |
| `npm run dev:web` | Web em modo desenvolvimento |
| `npm run test:api` | Testes da API (JUnit) |
| `npm run build` | Build de shared, API e web |
| `npm run start:api` | Roda a API compilada (`apps/api/target/finance-api.jar`) |
| `npm run lint` | Lint do shared e do web |

---

## Build de produção

```bash
npm run build
```

Para rodar a API compilada:

```bash
npm run start:api
```

Para pré-visualizar o front-end compilado:

```bash
npm run preview:web
```

---

## Problemas comuns

### API não sobe

- Confira se `java -version` mostra a versão 21 ou superior.
- Confira `PORT` e `WEB_ORIGIN` em `apps/api/.env`.
- Se um Markdown foi editado à mão e a API responder 500, confira o bloco YAML com `data/finance.example.md`.

### Porta já em uso

- API: altere `PORT` em `apps/api/.env`
- Web: use `npm run dev:web -- --port 5174` (ou outra porta livre)
- Se mudar a porta da API, atualize `VITE_API_URL` em `apps/web/.env`

### Front-end não encontra a API

- Confirme que a API está rodando (`npm run dev:api`)
- Verifique se `VITE_API_URL` corresponde à porta real da API
- Reinicie o Vite após alterar variáveis `VITE_*`
- Erros de rede aparecem na UI

---

## Estrutura resumida

```
finance/
├── apps/
│   ├── api/          # Back-end (Java + Spring Boot + Markdown)
│   └── web/          # Front-end (React + Vite)
├── data/             # Transactions, projects, categories, goals
├── packages/
│   └── shared/       # Tipos e schemas Zod usados pelo front-end
├── scripts/          # Atalho para o Maven Wrapper da API
└── package.json      # Scripts do monorepo
```
