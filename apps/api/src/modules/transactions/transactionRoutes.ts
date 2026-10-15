import type { FastifyInstance } from 'fastify';
import { createTransactionSchema } from '@finance/shared';
import { z } from 'zod';
import { markdownStore, StoreError } from '../../db/markdownStore.js';
import { presentTransaction } from '../../db/present.js';

const transactionParamsSchema = z.object({
  id: z.string().min(1),
});

export async function transactionRoutes(app: FastifyInstance) {
  app.get('/transactions', async () => {
    const snapshot = await markdownStore.readSnapshot();
    const transactions = [...snapshot.transactions].sort((left, right) =>
      right.date.localeCompare(left.date),
    );

    return transactions.map((transaction) => presentTransaction(transaction, snapshot.categories));
  });

  app.post('/transactions', async (request, reply) => {
    const payload = createTransactionSchema.parse(request.body);

    try {
      const transaction = await markdownStore.createTransaction(payload);
      const categories = await markdownStore.listCategories();
      return reply.code(201).send(presentTransaction(transaction, categories));
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });

  app.delete('/transactions/:id', async (request, reply) => {
    const { id } = transactionParamsSchema.parse(request.params);

    try {
      await markdownStore.deleteTransaction(id);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });
}
