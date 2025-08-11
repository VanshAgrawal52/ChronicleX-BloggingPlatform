import { config } from 'dotenv';
import { z } from 'zod';
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  ADMIN_INVITE_SECRET: z.string().optional(),
  GRAPHQL_PLAYGROUND: z.string().transform(v => v === 'true').default('false'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number).default('60000'),
  QUEUE_ENABLE: z.string().transform(v => v === 'true').default('true')
  ,CORS_ORIGINS: z.string().optional() // comma separated
  ,DISABLE_REDIS: z.string().transform(v => v === 'true').optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
