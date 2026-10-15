import type { FastifyInstance } from 'fastify';
import { createCategorySchema } from '@finance/shared';
import { z } from 'zod';
import { markdownStore, StoreError } from '../../db/markdownStore.js';

const categoryParamsSchema = z.object({
  id: z.string().min(1),
});

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/categories', async () => markdownStore.listCategories());

  app.post('/categories', async (request, reply) => {
    const payload = createCategorySchema.parse(request.body);

    try {
      const category = await markdownStore.createCategory(payload);
      return reply.code(201).send(category);
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });

  app.delete('/categories/:id', async (request, reply) => {
    const { id } = categoryParamsSchema.parse(request.params);

    try {
      await markdownStore.deleteCategory(id);
      return reply.code(204).send();
    } catch (error) {
      if (error instanceof StoreError && error.statusCode < 500) {
        return reply.code(error.statusCode).send({ message: error.message });
      }
      throw error;
    }
  });
}
