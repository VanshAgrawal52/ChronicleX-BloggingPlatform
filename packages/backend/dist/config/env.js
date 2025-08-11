"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('4000'),
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().url().optional(),
    JWT_SECRET: zod_1.z.string().min(16),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default('7d'),
    ADMIN_INVITE_SECRET: zod_1.z.string().optional(),
    GRAPHQL_PLAYGROUND: zod_1.z.string().transform(v => v === 'true').default('false'),
    RATE_LIMIT_MAX: zod_1.z.string().transform(Number).default('100'),
    RATE_LIMIT_TIME_WINDOW: zod_1.z.string().transform(Number).default('60000'),
    QUEUE_ENABLE: zod_1.z.string().transform(v => v === 'true').default('true'),
    CORS_ORIGINS: zod_1.z.string().optional(),
    DISABLE_REDIS: zod_1.z.string().transform(v => v === 'true').optional()
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map