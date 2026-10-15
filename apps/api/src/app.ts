import cors from '@fastify/cors';
import Fastify from 'fastify';
import { env } from './env.js';
import { dashboardRoutes } from './modules/dashboard/dashboardRoutes.js';
import { projectRoutes } from './modules/projects/projectRoutes.js';
import { transactionRoutes } from './modules/transactions/transactionRoutes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    methods: ['GET', 'HEAD', 'POST', 'DELETE'],
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(dashboardRoutes);
  await app.register(projectRoutes);
  await app.register(transactionRoutes);

  return app;
}
