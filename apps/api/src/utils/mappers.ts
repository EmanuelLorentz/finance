import type { Project, Transaction, Goal, UpcomingPayment } from '@finance/shared';

interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  budget: unknown;
  deadline: Date | null;
  impactsBalance: boolean;
  color: string;
  createdAt: Date;
}

interface CategoryRecord {
  name: string;
  color?: string;
}

interface TransactionRecord {
  id: string;
  description: string;
  amount: unknown;
  type: Transaction['type'];
  date: Date;
  account: string;
  projectId: string | null;
  category: CategoryRecord;
}

interface GoalRecord {
  id: string;
  name: string;
  targetAmount: unknown;
  currentAmount: unknown;
  deadline: Date;
  category: string;
}

interface UpcomingPaymentRecord {
  id: string;
  description: string;
  amount: unknown;
  dueDate: Date;
  category: string;
  isPaid: boolean;
}

export function toNumber(value: unknown): number {
  return Number(value);
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapProject(project: ProjectRecord): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? undefined,
    budget: project.budget == null ? undefined : toNumber(project.budget),
    deadline: project.deadline ? toDateOnly(project.deadline) : undefined,
    impactsBalance: project.impactsBalance,
    color: project.color,
    createdAt: toDateOnly(project.createdAt),
  };
}

export function mapTransaction(transaction: TransactionRecord): Transaction {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: toNumber(transaction.amount),
    type: transaction.type,
    category: transaction.category.name,
    date: toDateOnly(transaction.date),
    account: transaction.account,
    projectId: transaction.projectId ?? undefined,
  };
}

export function mapGoal(goal: GoalRecord): Goal {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: toNumber(goal.targetAmount),
    currentAmount: toNumber(goal.currentAmount),
    deadline: toDateOnly(goal.deadline),
    category: goal.category,
  };
}

export function mapUpcomingPayment(payment: UpcomingPaymentRecord): UpcomingPayment {
  return {
    id: payment.id,
    description: payment.description,
    amount: toNumber(payment.amount),
    dueDate: toDateOnly(payment.dueDate),
    category: payment.category,
    isPaid: payment.isPaid,
  };
}
