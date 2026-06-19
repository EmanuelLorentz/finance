import type { FastifyInstance } from 'fastify';
import { createProjectSchema } from '@finance/shared';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { mapProject, mapTransaction } from '../../utils/mappers.js';

const projectParamsSchema = z.object({
  id: z.string(),
});

export async function projectRoutes(app: FastifyInstance) {
  app.get('/projects', async () => {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return projects.map(mapProject);
  });

  app.post('/projects', async (request, reply) => {
    const payload = createProjectSchema.parse(request.body);

    const project = await prisma.project.create({
      data: {
        name: payload.name,
        description: payload.description,
        budget: payload.budget,
        deadline: payload.deadline ? new Date(payload.deadline) : undefined,
        impactsBalance: payload.impactsBalance,
        color: payload.color,
      },
    });

    return reply.code(201).send(mapProject(project));
  });

  app.get('/projects/:id', async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return reply.code(404).send({ message: 'Project not found' });
    }

    return mapProject(project);
  });

  app.get('/projects/:id/transactions', async (request, reply) => {
    const { id } = projectParamsSchema.parse(request.params);

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!project) {
      return reply.code(404).send({ message: 'Project not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { projectId: id },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return transactions.map(mapTransaction);
  });
}
