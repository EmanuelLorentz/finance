# Finance

Projeto pessoal em desenvolvimento.

## Desenvolvimento

A aplicação foi desenhada para ser pequena, legível e possível de evoluir sem reescrever a base. A interface, a API e o contrato entre as duas ficam separados. A tela não sabe onde o dado é gravado. A API valida o que entra e devolve o que a interface já espera.

O repositório guarda o software. O conteúdo pessoal fica na máquina e fora do Git.

O que o código mostra:

- Monorepo com interface, API e tipos compartilhados, para os dois lados falarem a mesma língua.
- TypeScript de ponta a ponta, com validação na entrada da API.
- Interface desacoplada da persistência: a tela consome a API por serviços e hooks.
- Execução local, sem banco externo para desenvolver e usar.
- Dados sensíveis fora do histórico do Git.
