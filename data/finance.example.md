# Exemplo de armazenamento local

A API não lê este arquivo. Ele só documenta o formato dos Markdown reais, criados em `data/` e ignorados pelo Git.

## Categories

```yaml
- id: cat-food
  name: Alimentação
  color: "#4ade80"
```

## Projects

```yaml
- id: project-house
  name: Casa
  description: Reserva da reforma
  budget: 12000
  deadline: 2026-12-31
  impactsBalance: true
  color: "#60a5fa"
  createdAt: 2026-10-13
```

## Transactions

```yaml
- id: tx-salary
  description: Salário
  amount: 8500.5
  type: income
  date: 2026-10-05
  account: Nubank
  categoryId: cat-food
  projectId: project-house
```

## Goals

```yaml
- id: goal-emergency
  name: Reserva de emergência
  targetAmount: 30000
  currentAmount: 8000
  deadline: 2027-06-01
  category: Savings
```

## Upcoming Payments

```yaml
- id: payment-rent
  description: Aluguel
  amount: 2200
  dueDate: 2026-11-05
  category: Moradia
  isPaid: false
```
