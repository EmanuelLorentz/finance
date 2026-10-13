import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import type { CreateProjectData, CreateTransactionData, TransactionType } from '@finance/shared';
import { parse, stringify } from 'yaml';
import { z } from 'zod';
import { env } from '../env.js';
import { todayDateOnly } from '../utils/mappers.js';

const DEFAULT_CATEGORY_COLOR = '#6b7280';
const YAML_FENCE = /```ya?ml\r?\n([\s\S]*?)```/;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  deadline: dateSchema.optional(),
  impactsBalance: z.boolean(),
  color: z.string().min(1),
  createdAt: dateSchema,
});

const transactionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  type: z.enum(['income', 'expense', 'transfer']),
  date: dateSchema,
  account: z.string().min(1),
  categoryId: z.string().min(1),
  projectId: z.string().min(1).optional(),
});

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  deadline: dateSchema,
  category: z.string().min(1),
});

const upcomingPaymentSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  amount: z.number().nonnegative(),
  dueDate: dateSchema,
  category: z.string().min(1),
  isPaid: z.boolean(),
});

export type StoredCategory = z.infer<typeof categorySchema>;
export type StoredProject = z.infer<typeof projectSchema>;
export type StoredTransaction = z.infer<typeof transactionSchema>;
export type StoredGoal = z.infer<typeof goalSchema>;
export type StoredUpcomingPayment = z.infer<typeof upcomingPaymentSchema>;

export interface FinanceSnapshot {
  categories: StoredCategory[];
  projects: StoredProject[];
  transactions: StoredTransaction[];
  goals: StoredGoal[];
  upcomingPayments: StoredUpcomingPayment[];
}

interface CollectionDefinition<T> {
  fileName: string;
  title: string;
  description: string;
  schema: z.ZodType<T[]>;
}

const collections = {
  categories: {
    fileName: 'categories.md',
    title: 'Categories',
    description: 'Classificações usadas nas transactions. Edite apenas o bloco YAML.',
    schema: z.array(categorySchema),
  },
  projects: {
    fileName: 'projects.md',
    title: 'Projects',
    description: 'Projects acompanhados na aplicação. Edite apenas o bloco YAML.',
    schema: z.array(projectSchema),
  },
  transactions: {
    fileName: 'transactions.md',
    title: 'Transactions',
    description: 'Transactions de income, expense e transfer. Edite apenas o bloco YAML.',
    schema: z.array(transactionSchema),
  },
  goals: {
    fileName: 'goals.md',
    title: 'Goals',
    description: 'Goals financeiros. Edite apenas o bloco YAML.',
    schema: z.array(goalSchema),
  },
  upcomingPayments: {
    fileName: 'upcoming-payments.md',
    title: 'Upcoming Payments',
    description: 'Pagamentos previstos. Edite apenas o bloco YAML.',
    schema: z.array(upcomingPaymentSchema),
  },
} as const satisfies Record<string, CollectionDefinition<unknown>>;

type CollectionName = keyof typeof collections;

export class StoreError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = 'StoreError';
  }
}

let writeQueue: Promise<void> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function resolveDataDir(): string {
  if (env.DATA_DIR) {
    return path.resolve(env.DATA_DIR);
  }

  let current = path.dirname(fileURLToPath(import.meta.url));

  for (let depth = 0; depth < 8; depth += 1) {
    const packagePath = path.join(current, 'package.json');
    if (existsSync(packagePath)) {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { workspaces?: unknown };
      if (packageJson.workspaces) {
        return path.join(current, 'data');
      }
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  throw new StoreError('Não foi possível localizar a pasta data/ na raiz do repositório.', 500);
}

function collectionPath(fileName: string): string {
  return path.join(resolveDataDir(), fileName);
}

function renderMarkdown<T>(definition: CollectionDefinition<T>, records: T[]): string {
  const yaml = stringify(records, { lineWidth: 0 }).trimEnd();
  return `# ${definition.title}\n\n${definition.description}\n\n\`\`\`yaml\n${yaml}\n\`\`\`\n`;
}

async function writeAtomic(filePath: string, contents: string): Promise<void> {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, contents, 'utf8');

  try {
    await rename(temporaryPath, filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'EPERM' && code !== 'EEXIST') {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    }

    await unlink(filePath);
    await rename(temporaryPath, filePath);
  }
}

async function readCollection<T>(name: CollectionName): Promise<T[]> {
  const definition = collections[name] as unknown as CollectionDefinition<T>;
  const filePath = collectionPath(definition.fileName);
  await mkdir(path.dirname(filePath), { recursive: true });

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    await writeAtomic(filePath, renderMarkdown(definition, []));
    return [];
  }

  const fenced = markdown.match(YAML_FENCE);
  if (!fenced) {
    throw new StoreError(`O arquivo ${definition.fileName} não tem um bloco YAML.`, 500);
  }

  let parsed: unknown;
  try {
    parsed = parse(fenced[1]);
  } catch {
    throw new StoreError(`YAML inválido em ${definition.fileName}.`, 500);
  }

  const result = definition.schema.safeParse(parsed ?? []);
  if (!result.success) {
    throw new StoreError(`Dados inválidos em ${definition.fileName}.`, 500);
  }

  return result.data;
}

async function writeCollection<T>(name: CollectionName, records: T[]): Promise<void> {
  const definition = collections[name] as unknown as CollectionDefinition<T>;
  const filePath = collectionPath(definition.fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeAtomic(filePath, renderMarkdown(definition, records));
}

function byDateDescending(left: string, right: string): number {
  return right.localeCompare(left);
}

function byDateAscending(left: string, right: string): number {
  return left.localeCompare(right);
}

async function readSnapshotUnlocked(): Promise<FinanceSnapshot> {
  const [categories, projects, transactions, goals, upcomingPayments] = await Promise.all([
    readCollection<StoredCategory>('categories'),
    readCollection<StoredProject>('projects'),
    readCollection<StoredTransaction>('transactions'),
    readCollection<StoredGoal>('goals'),
    readCollection<StoredUpcomingPayment>('upcomingPayments'),
  ]);

  return { categories, projects, transactions, goals, upcomingPayments };
}

export const markdownStore = {
  readSnapshot(): Promise<FinanceSnapshot> {
    return enqueue(readSnapshotUnlocked);
  },

  async listProjects(): Promise<StoredProject[]> {
    return enqueue(async () => {
      const projects = await readCollection<StoredProject>('projects');
      return projects.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    });
  },

  async getProject(id: string): Promise<StoredProject | undefined> {
    return enqueue(async () => {
      const projects = await readCollection<StoredProject>('projects');
      return projects.find((project) => project.id === id);
    });
  },

  async createProject(input: CreateProjectData): Promise<StoredProject> {
    return enqueue(async () => {
      const projects = await readCollection<StoredProject>('projects');
      const project: StoredProject = {
        id: randomUUID(),
        name: input.name,
        impactsBalance: input.impactsBalance,
        color: input.color,
        createdAt: todayDateOnly(),
        ...(input.description ? { description: input.description } : {}),
        ...(input.budget != null ? { budget: input.budget } : {}),
        ...(input.deadline ? { deadline: input.deadline } : {}),
      };

      projects.push(project);
      await writeCollection('projects', projects);
      return project;
    });
  },

  async listTransactions(projectId?: string): Promise<StoredTransaction[]> {
    return enqueue(async () => {
      const transactions = await readCollection<StoredTransaction>('transactions');
      return transactions
        .filter((transaction) => (projectId ? transaction.projectId === projectId : true))
        .sort((left, right) => byDateDescending(left.date, right.date));
    });
  },

  async listCategories(): Promise<StoredCategory[]> {
    return enqueue(() => readCollection<StoredCategory>('categories'));
  },

  async createTransaction(input: CreateTransactionData): Promise<StoredTransaction> {
    return enqueue(async () => {
      const projectId = input.projectId || undefined;
      const [categories, projects, transactions] = await Promise.all([
        readCollection<StoredCategory>('categories'),
        readCollection<StoredProject>('projects'),
        readCollection<StoredTransaction>('transactions'),
      ]);

      if (projectId && !projects.some((project) => project.id === projectId)) {
        throw new StoreError('Project not found', 400);
      }

      let category = categories.find((item) => item.name === input.category);
      if (!category) {
        category = {
          id: randomUUID(),
          name: input.category,
          color: DEFAULT_CATEGORY_COLOR,
        };
        categories.push(category);
        await writeCollection('categories', categories);
      }

      const transaction: StoredTransaction = {
        id: randomUUID(),
        description: input.description,
        amount: input.amount,
        type: input.type satisfies TransactionType,
        date: input.date,
        account: input.account,
        categoryId: category.id,
        ...(projectId ? { projectId } : {}),
      };

      transactions.push(transaction);
      await writeCollection('transactions', transactions);
      return transaction;
    });
  },

  async listGoals(): Promise<StoredGoal[]> {
    return enqueue(async () => {
      const goals = await readCollection<StoredGoal>('goals');
      return goals.sort((left, right) => byDateAscending(left.deadline, right.deadline));
    });
  },

  async listUpcomingPayments(): Promise<StoredUpcomingPayment[]> {
    return enqueue(async () => {
      const payments = await readCollection<StoredUpcomingPayment>('upcomingPayments');
      return payments
        .filter((payment) => !payment.isPaid)
        .sort((left, right) => byDateAscending(left.dueDate, right.dueDate));
    });
  },
};
