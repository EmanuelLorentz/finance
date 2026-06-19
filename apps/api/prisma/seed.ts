import { prisma } from '../src/db/prisma.js';

const categories = [
  { id: 'cat-salary', name: 'Salário', color: '#4ade80' },
  { id: 'cat-freelance', name: 'Freelance', color: '#38bdf8' },
  { id: 'cat-housing', name: 'Moradia', color: '#60a5fa' },
  { id: 'cat-food', name: 'Alimentação', color: '#4ade80' },
  { id: 'cat-subscriptions', name: 'Assinaturas', color: '#38bdf8' },
  { id: 'cat-health', name: 'Saúde', color: '#f87171' },
  { id: 'cat-transport', name: 'Transporte', color: '#fbbf24' },
  { id: 'cat-investments', name: 'Investimentos', color: '#a78bfa' },
  { id: 'cat-services', name: 'Serviços', color: '#a78bfa' },
  { id: 'cat-home', name: 'Casa', color: '#fb923c' },
  { id: 'cat-entertainment', name: 'Entretenimento', color: '#f472b6' },
  { id: 'cat-other', name: 'Outros', color: '#6b7280' },
];

const projects = [
  {
    id: 'p1',
    name: 'Casamento',
    description: 'Planejamento e despesas do casamento em novembro de 2027',
    budget: 45000,
    deadline: new Date('2027-11-20'),
    impactsBalance: true,
    color: '#f472b6',
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'p2',
    name: 'Reforma da Cozinha',
    description: 'Renovação completa da cozinha com armários planejados',
    budget: 15000,
    deadline: new Date('2026-10-15'),
    impactsBalance: true,
    color: '#fb923c',
    createdAt: new Date('2026-03-01'),
  },
];

const transactions = [
  {
    id: '1',
    description: 'Salário',
    amount: 8200,
    type: 'income' as const,
    categoryId: 'cat-salary',
    date: new Date('2026-06-01'),
    account: 'Conta Corrente',
  },
  {
    id: '2',
    description: 'Aluguel',
    amount: 1800,
    type: 'expense' as const,
    categoryId: 'cat-housing',
    date: new Date('2026-06-05'),
    account: 'Conta Corrente',
  },
  {
    id: '3',
    description: 'Supermercado Extra',
    amount: 385,
    type: 'expense' as const,
    categoryId: 'cat-food',
    date: new Date('2026-06-08'),
    account: 'Conta Corrente',
  },
  {
    id: '4',
    description: 'Freelance Web Design',
    amount: 1500,
    type: 'income' as const,
    categoryId: 'cat-freelance',
    date: new Date('2026-06-10'),
    account: 'Conta Corrente',
  },
  {
    id: '5',
    description: 'Internet Vivo',
    amount: 120,
    type: 'expense' as const,
    categoryId: 'cat-subscriptions',
    date: new Date('2026-06-10'),
    account: 'Conta Corrente',
  },
  {
    id: '6',
    description: 'Academia Smart Fit',
    amount: 89,
    type: 'expense' as const,
    categoryId: 'cat-health',
    date: new Date('2026-06-11'),
    account: 'Conta Corrente',
  },
  {
    id: '7',
    description: 'Restaurante Madero',
    amount: 145,
    type: 'expense' as const,
    categoryId: 'cat-food',
    date: new Date('2026-06-12'),
    account: 'Conta Corrente',
  },
  {
    id: '8',
    description: 'Uber',
    amount: 38,
    type: 'expense' as const,
    categoryId: 'cat-transport',
    date: new Date('2026-06-13'),
    account: 'Conta Corrente',
  },
  {
    id: '9',
    description: 'Transferência CDB',
    amount: 1000,
    type: 'transfer' as const,
    categoryId: 'cat-investments',
    date: new Date('2026-06-14'),
    account: 'Conta Corrente',
  },
  {
    id: '10',
    description: 'Farmácia Drogasil',
    amount: 67,
    type: 'expense' as const,
    categoryId: 'cat-health',
    date: new Date('2026-06-15'),
    account: 'Conta Corrente',
  },
  {
    id: 'pt1',
    description: 'Buffet — Sinal',
    amount: 3000,
    type: 'expense' as const,
    categoryId: 'cat-food',
    date: new Date('2026-02-10'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt2',
    description: 'Espaço — Reserva',
    amount: 5000,
    type: 'expense' as const,
    categoryId: 'cat-services',
    date: new Date('2026-02-15'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt3',
    description: 'Contribuição dos Padrinhos',
    amount: 2000,
    type: 'income' as const,
    categoryId: 'cat-other',
    date: new Date('2026-03-01'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt4',
    description: 'Fotógrafo — Contrato',
    amount: 4500,
    type: 'expense' as const,
    categoryId: 'cat-services',
    date: new Date('2026-03-20'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt5',
    description: 'Convites e Papelaria',
    amount: 800,
    type: 'expense' as const,
    categoryId: 'cat-other',
    date: new Date('2026-04-05'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt6',
    description: 'DJ e Sonorização',
    amount: 2200,
    type: 'expense' as const,
    categoryId: 'cat-entertainment',
    date: new Date('2026-05-10'),
    account: 'Conta Corrente',
    projectId: 'p1',
  },
  {
    id: 'pt7',
    description: 'Projeto Arquitetônico',
    amount: 1200,
    type: 'expense' as const,
    categoryId: 'cat-services',
    date: new Date('2026-03-05'),
    account: 'Conta Corrente',
    projectId: 'p2',
  },
  {
    id: 'pt8',
    description: 'Cerâmica e Revestimentos',
    amount: 2400,
    type: 'expense' as const,
    categoryId: 'cat-home',
    date: new Date('2026-04-12'),
    account: 'Conta Corrente',
    projectId: 'p2',
  },
  {
    id: 'pt9',
    description: 'Mão de Obra — Pedreiro',
    amount: 3500,
    type: 'expense' as const,
    categoryId: 'cat-services',
    date: new Date('2026-05-03'),
    account: 'Conta Corrente',
    projectId: 'p2',
  },
  {
    id: 'pt10',
    description: 'Armários Planejados — Sinal',
    amount: 2000,
    type: 'expense' as const,
    categoryId: 'cat-home',
    date: new Date('2026-06-08'),
    account: 'Conta Corrente',
    projectId: 'p2',
  },
];

const goals = [
  {
    id: 'goal-1',
    name: 'Reserva de Emergência',
    targetAmount: 50000,
    currentAmount: 24000,
    deadline: new Date('2026-12-31'),
    category: 'Segurança',
  },
  {
    id: 'goal-2',
    name: 'Viagem para Europa',
    targetAmount: 15000,
    currentAmount: 8500,
    deadline: new Date('2027-07-01'),
    category: 'Lazer',
  },
  {
    id: 'goal-3',
    name: 'Novo Notebook',
    targetAmount: 5500,
    currentAmount: 4200,
    deadline: new Date('2026-09-01'),
    category: 'Tecnologia',
  },
];

const upcomingPayments = [
  {
    id: 'payment-1',
    description: 'Aluguel',
    amount: 1800,
    dueDate: new Date('2026-06-25'),
    category: 'Moradia',
    isPaid: false,
  },
  {
    id: 'payment-2',
    description: 'Netflix',
    amount: 45.9,
    dueDate: new Date('2026-06-28'),
    category: 'Assinaturas',
    isPaid: false,
  },
  {
    id: 'payment-3',
    description: 'Internet Vivo',
    amount: 119.9,
    dueDate: new Date('2026-07-02'),
    category: 'Assinaturas',
    isPaid: false,
  },
];

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.upcomingPayment.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.project.deleteMany();

  await prisma.category.createMany({ data: categories });
  await prisma.project.createMany({ data: projects });
  await prisma.transaction.createMany({ data: transactions });
  await prisma.goal.createMany({ data: goals });
  await prisma.upcomingPayment.createMany({ data: upcomingPayments });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
