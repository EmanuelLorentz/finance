import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  DATA_DIR: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
