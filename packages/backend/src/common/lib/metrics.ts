import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method','route','status'],
  buckets: [0.05,0.1,0.2,0.3,0.5,0.8,1,2,5]
});
register.registerMetric(httpRequestDuration);

export function metricsRoute() {
  return async (_req: any, reply: any) => {
    reply.header('Content-Type', register.contentType);
    reply.send(await register.metrics());
  };
}
