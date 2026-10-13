import type { Goal, Project, Transaction, UpcomingPayment } from '@finance/shared';
import type {
  FinanceSnapshot,
  StoredCategory,
  StoredGoal,
  StoredProject,
  StoredTransaction,
  StoredUpcomingPayment,
} from './markdownStore.js';
import { mapGoal, mapProject, mapTransaction, mapUpcomingPayment, parseDateOnly } from '../utils/mappers.js';

const FALLBACK_CATEGORY = {
  name: 'Outros',
  color: '#6b7280',
};

export interface JoinedTransaction {
  id: string;
  description: string;
  amount: number;
  type: Transaction['type'];
  date: Date;
  account: string;
  projectId: string | null;
  category: { name: string; color: string };
  project?: { impactsBalance: boolean };
}

function categoryOf(transaction: StoredTransaction, categories: StoredCategory[]) {
  return categories.find((category) => category.id === transaction.categoryId) ?? FALLBACK_CATEGORY;
}

export function presentProject(project: StoredProject): Project {
  return mapProject({
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    budget: project.budget ?? null,
    deadline: project.deadline ? parseDateOnly(project.deadline) : null,
    impactsBalance: project.impactsBalance,
    color: project.color,
    createdAt: parseDateOnly(project.createdAt),
  });
}

export function presentTransaction(
  transaction: StoredTransaction,
  categories: StoredCategory[],
): Transaction {
  return mapTransaction({
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    date: parseDateOnly(transaction.date),
    account: transaction.account,
    projectId: transaction.projectId ?? null,
    category: categoryOf(transaction, categories),
  });
}

export function presentGoal(goal: StoredGoal): Goal {
  return mapGoal({
    ...goal,
    deadline: parseDateOnly(goal.deadline),
  });
}

export function presentUpcomingPayment(payment: StoredUpcomingPayment): UpcomingPayment {
  return mapUpcomingPayment({
    ...payment,
    dueDate: parseDateOnly(payment.dueDate),
  });
}

export function joinTransactions(snapshot: FinanceSnapshot): JoinedTransaction[] {
  const projectsById = new Map(snapshot.projects.map((project) => [project.id, project]));

  return snapshot.transactions
    .map((transaction) => {
      const project = transaction.projectId ? projectsById.get(transaction.projectId) : undefined;
      return {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        date: parseDateOnly(transaction.date),
        account: transaction.account,
        projectId: transaction.projectId ?? null,
        category: categoryOf(transaction, snapshot.categories),
        project: project ? { impactsBalance: project.impactsBalance } : undefined,
      };
    })
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}
