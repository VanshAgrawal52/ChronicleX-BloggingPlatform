import { ZodError } from 'zod';
import { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: err.flatten() });
    }
    if ((err as any).validation) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', details: (err as any).validation });
    }
    const status = (err as any).statusCode || 500;
    reply.code(status).send({ error: err.name || 'Error', message: err.message || 'Internal Server Error' });
  });
}
