import type { FastifyInstance } from 'fastify';
import { createTransactionSchema } from '@finance/shared';
import { prisma } from '../../db/prisma.js';
import { mapTransaction } from '../../utils/mappers.js';

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/transactions', async () => {
    const transactions = await prisma.transaction.findMany({
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return transactions.map(mapTransaction);
  });

  app.post('/transactions', async (request, reply) => {
    const payload = createTransactionSchema.parse(request.body);

    const category = await prisma.category.upsert({
      where: { name: payload.category },
      update: {},
      create: {
        name: payload.category,
        color: '#6b7280',
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        description: payload.description,
        amount: payload.amount,
        type: payload.type,
        date: new Date(payload.date),
        account: payload.account,
        categoryId: category.id,
        projectId: payload.projectId,
      },
      include: { category: true },
    });

    return reply.code(201).send(mapTransaction(transaction));
  });
}
