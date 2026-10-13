import type { FastifyInstance } from 'fastify';
import { createProjectSchema } from '@finance/shared';
import { z } from 'zod';
import { markdownStore } from '../../db/markdownStore.js';
import { presentProject, presentTransaction } from '../../db/present.js';

const projectParamsSchema = z.object({
  id: z.string(),
});

export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', async () => {
    const projects = await markdownStore.listProjects();
    return projects.map(presentProject);
  });

  app.post('/projects', async (request, reply) => {
    const payload = createProjectSchema.parse(request.body);
    const project = await markdownStore.createProject(payload);
    return reply.code(201).send(presentProject(project));
  });

  app.get('/projects/:id', async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);
    const project = await markdownStore.getProject(id);

    if (!project) {
      return reply.code(404).send({ message: 'Project not found' });
    }

    return presentProject(project);
  });

  app.get('/projects/:id/transactions', async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);
    const project = await markdownStore.getProject(id);

    if (!project) {
      return reply.code(404).send({ message: 'Project not found' });
    }

    const [transactions, categories] = await Promise.all([
      markdownStore.listTransactions(id),
      markdownStore.listCategories(),
    ]);

    return transactions.map((transaction) => presentTransaction(transaction, categories));
  });
}
