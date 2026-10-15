# Dados locais

A API grava as finanças em Markdown nesta pasta. Esses arquivos ficam na sua máquina e não sobem para o GitHub.

| Arquivo | Conteúdo |
|---------|----------|
| `categories.md` | Categories |
| `accounts.md` | Contas |
| `projects.md` | Projects |
| `transactions.md` | Transactions |
| `goals.md` | Goals |
| `upcoming-payments.md` | Pagamentos previstos |

A API cria os arquivos na primeira leitura, cada um com um bloco YAML. O modelo versionado está em `finance.example.md`.

No YAML, valores usam ponto decimal (`8500.50`) e datas usam `AAAA-MM-DD`. A interface continua exibindo `R$ 8.500,50` e `DD/MM/AAAA`.
