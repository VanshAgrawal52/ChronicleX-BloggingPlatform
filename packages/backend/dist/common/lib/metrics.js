"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequestDuration = void 0;
exports.metricsRoute = metricsRoute;
const prom_client_1 = __importDefault(require("prom-client"));
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
exports.httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 5]
});
register.registerMetric(exports.httpRequestDuration);
function metricsRoute() {
    return async (_req, reply) => {
        reply.header('Content-Type', register.contentType);
        reply.send(await register.metrics());
    };
}
//# sourceMappingURL=metrics.js.map