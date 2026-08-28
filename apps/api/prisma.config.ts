import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Migrations prefer DIRECT_URL (Supabase Direct) when set;
// runtime Prisma Client keeps using DATABASE_URL via apps/api/src/db/prisma.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL || env('DATABASE_URL'),
  },
});
