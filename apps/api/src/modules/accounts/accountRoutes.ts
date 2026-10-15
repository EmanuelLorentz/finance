import type { FastifyInstance } from 'fastify';
import { createAccountSchema } from '@finance/shared';
import { z } from 'zod';
import { markdownStore, StoreError } from '../../db/markdownStore.js';

const accountParamsSchema = z.object({
  id: z.string().min(1),
});

export async function accountRoutes(app: FastifyInstance) {
  app.get('/accounts', async () => markdownStore.listAccounts());

  app.post('/accounts', async (request, reply) => {
    const payload = createAccountSchema.parse(request.body);

    try {
      const account = await markdownStore.createAccount(payload);
      return reply.code(201).send(account);
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });

  app.delete('/accounts/:id', async (request, reply) => {
    const { id } = accountParamsSchema.parse(request.params);

    try {
      await markdownStore.deleteAccount(id);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });
}
