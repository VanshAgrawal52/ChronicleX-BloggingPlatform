import 'reflect-metadata';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import mercurius from 'mercurius';
import { env } from '@config/env';
import { logger } from '@common/lib/logger';
import { prisma } from '@common/lib/prisma';
import { cacheDisconnect } from '@common/lib/cache';
import { typeDefs, resolvers, buildContext } from './modules/graphql/schema.js';
import { registerRoutes } from './modules/http/routes.js';
import { initWorkers } from './modules/queue/index.js';
import { httpRequestDuration, metricsRoute } from '@common/lib/metrics';
import { registerErrorHandler } from '@common/lib/errors.js';
import { registerCommentSocket } from './modules/ws/commentsChannel.js';
import { cachePing } from '@common/lib/cache';

async function bootstrap() {
  const app = Fastify({ logger });

  const origins = env.CORS_ORIGINS ? env.CORS_ORIGINS.split(',').map(o=>o.trim()).filter(Boolean) : true;
  await app.register(fastifyCors, { origin: origins, credentials: true });
  await app.register(fastifyHelmet);
  await app.register(fastifyRateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_TIME_WINDOW });
  await app.register(websocket);
  if (!env.REDIS_URL || (env as any).DISABLE_REDIS) {
    logger.warn('Redis disabled (no URL or DISABLE_REDIS set); cache & queues disabled');
  }

  // REST routes
  app.get('/healthz', async (_req, reply) => {
    const dbOk = await prisma.$queryRaw`SELECT 1`.then(()=>true).catch(()=>false);
    const cacheOk = await cachePing();
    reply.send({ status: (dbOk ? 1:0) & (cacheOk?1:0) ? 'ok':'degraded', db: dbOk, cache: cacheOk });
  });
  app.addHook('onRequest', async (req, _reply) => {
    (req as any)._start = process.hrtime.bigint();
  });
  app.addHook('onResponse', async (req, reply) => {
    const start = (req as any)._start as bigint | undefined;
    if (start) {
      const diffNs = Number(process.hrtime.bigint() - start);
      httpRequestDuration.labels({ method: req.method, route: req.routeOptions?.url || req.url, status: String(reply.statusCode) }).observe(diffNs / 1e9);
    }
  });
  await registerRoutes(app as any);
  registerErrorHandler(app as any);

  // Initialize background workers
  initWorkers();

  // Metrics endpoint
  app.get('/metrics', metricsRoute());

  // GraphQL (Mercurius)
  await app.register(mercurius, {
    schema: typeDefs,
    resolvers,
    graphiql: env.GRAPHQL_PLAYGROUND,
    context: buildContext
  });

  // WebSocket comments basic channel
  app.get('/ws/posts/:postId/comments', { websocket: true }, (connection: any, req: any) => {
    const postId = (req.params as any).postId as string;
    registerCommentSocket(postId, connection.socket);
  });

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`🚀 Backend running on port ${env.PORT}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }

  const shutdown = async (signal: string) => {
    try {
      logger.info({ signal }, 'Shutdown initiated');
      await app.close();
      await cacheDisconnect();
      await prisma.$disconnect();
      logger.info('Shutdown complete');
      process.exit(0);
    } catch (e) {
      logger.error(e, 'Error during shutdown');
      process.exit(1);
    }
  };
  ['SIGINT','SIGTERM'].forEach(s => process.on(s as any, () => shutdown(s)));
}

bootstrap();
