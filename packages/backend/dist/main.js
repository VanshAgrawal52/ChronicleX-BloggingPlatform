"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const helmet_1 = __importDefault(require("@fastify/helmet"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const mercurius_1 = __importDefault(require("mercurius"));
const env_1 = require("./config/env");
const logger_1 = require("./common/lib/logger");
const prisma_1 = require("./common/lib/prisma");
const cache_1 = require("./common/lib/cache");
const schema_js_1 = require("./modules/graphql/schema.js");
const routes_js_1 = require("./modules/http/routes.js");
const index_js_1 = require("./modules/queue/index.js");
const metrics_1 = require("./common/lib/metrics");
const errors_js_1 = require("./common/lib/errors.js");
const commentsChannel_js_1 = require("./modules/ws/commentsChannel.js");
const cache_2 = require("./common/lib/cache");
async function bootstrap() {
    const app = (0, fastify_1.default)({ logger: logger_1.logger });
    const origins = env_1.env.CORS_ORIGINS ? env_1.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) : true;
    await app.register(cors_1.default, { origin: origins, credentials: true });
    await app.register(helmet_1.default);
    await app.register(rate_limit_1.default, { max: env_1.env.RATE_LIMIT_MAX, timeWindow: env_1.env.RATE_LIMIT_TIME_WINDOW });
    await app.register(websocket_1.default);
    if (!env_1.env.REDIS_URL || env_1.env.DISABLE_REDIS) {
        logger_1.logger.warn('Redis disabled (no URL or DISABLE_REDIS set); cache & queues disabled');
    }
    app.get('/healthz', async (_req, reply) => {
        const dbOk = await prisma_1.prisma.$queryRaw `SELECT 1`.then(() => true).catch(() => false);
        const cacheOk = await (0, cache_2.cachePing)();
        reply.send({ status: (dbOk ? 1 : 0) & (cacheOk ? 1 : 0) ? 'ok' : 'degraded', db: dbOk, cache: cacheOk });
    });
    app.addHook('onRequest', async (req, _reply) => {
        req._start = process.hrtime.bigint();
    });
    app.addHook('onResponse', async (req, reply) => {
        const start = req._start;
        if (start) {
            const diffNs = Number(process.hrtime.bigint() - start);
            metrics_1.httpRequestDuration.labels({ method: req.method, route: req.routeOptions?.url || req.url, status: String(reply.statusCode) }).observe(diffNs / 1e9);
        }
    });
    await (0, routes_js_1.registerRoutes)(app);
    (0, errors_js_1.registerErrorHandler)(app);
    (0, index_js_1.initWorkers)();
    app.get('/metrics', (0, metrics_1.metricsRoute)());
    await app.register(mercurius_1.default, {
        schema: schema_js_1.typeDefs,
        resolvers: schema_js_1.resolvers,
        graphiql: env_1.env.GRAPHQL_PLAYGROUND,
        context: schema_js_1.buildContext
    });
    app.get('/ws/posts/:postId/comments', { websocket: true }, (connection, req) => {
        const postId = req.params.postId;
        (0, commentsChannel_js_1.registerCommentSocket)(postId, connection.socket);
    });
    try {
        await app.listen({ port: env_1.env.PORT, host: '0.0.0.0' });
        logger_1.logger.info(`🚀 Backend running on port ${env_1.env.PORT}`);
    }
    catch (err) {
        logger_1.logger.error(err, 'Failed to start server');
        process.exit(1);
    }
    const shutdown = async (signal) => {
        try {
            logger_1.logger.info({ signal }, 'Shutdown initiated');
            await app.close();
            await (0, cache_1.cacheDisconnect)();
            await prisma_1.prisma.$disconnect();
            logger_1.logger.info('Shutdown complete');
            process.exit(0);
        }
        catch (e) {
            logger_1.logger.error(e, 'Error during shutdown');
            process.exit(1);
        }
    };
    ['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));
}
bootstrap();
//# sourceMappingURL=main.js.map