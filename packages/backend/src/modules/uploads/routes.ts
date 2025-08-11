import { FastifyInstance } from 'fastify';
import { authGuard } from '@common/middleware/auth';

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/api/uploads/presign', { preHandler: authGuard(['AUTHOR','ADMIN']) }, async (_req, reply) => {
    reply.send({ url: 'https://example.com/upload', fields: { key: 'placeholder' }, expiresIn: 300 });
  });
}
