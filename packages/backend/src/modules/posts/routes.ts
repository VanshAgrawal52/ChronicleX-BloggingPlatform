import { FastifyInstance } from 'fastify';
import { PostService } from './service.js';
import { authGuard } from '@common/middleware/auth';
import { z } from 'zod';

export async function postRoutes(app: FastifyInstance) {
  const service = new PostService();

  app.get('/api/posts', async (req, reply) => {
    const { page = '1', pageSize = '10', search, tag } = req.query as any;
    const result = await service.list(Number(page), Number(pageSize), search, tag);
    reply.send(result);
  });

  app.get('/api/posts/:slug', async (req, reply) => {
    const { slug } = req.params as any;
    const post = await service.getBySlug(slug);
    if (!post) return reply.code(404).send({ message: 'Not found' });
    reply.send(post);
  });

  const createSchema = z.object({ title: z.string().min(3), content: z.string().min(1), tags: z.array(z.string()).optional() });
  app.post('/api/posts', { preHandler: authGuard(['READER','AUTHOR','ADMIN']) }, async (req, reply) => {
    const user = (req as any).user;
    const { title, content, tags = [] } = createSchema.parse(req.body);
    const created = await service.create(user.sub, title, content, tags);
    reply.code(201).send(created);
  });

  app.post('/api/posts/:id/publish', { preHandler: authGuard(['READER','AUTHOR','ADMIN']) }, async (req, reply) => {
    const user = (req as any).user;
    const { id } = req.params as any;
    try {
      const updated = await service.publish(id, user.sub, user.role === 'ADMIN');
      reply.send(updated);
    } catch (e: any) {
      if (e.message === 'Post not found') return reply.code(404).send({ message: e.message });
      if (e.message === 'Forbidden') return reply.code(403).send({ message: e.message });
      reply.code(400).send({ message: e.message });
    }
  });

  app.delete('/api/posts/:id', { preHandler: authGuard(['ADMIN']) }, async (req, reply) => {
    const { id } = req.params as any;
    try {
      await service.remove(id);
      reply.send({ ok: true });
    } catch (e: any) {
      if (e.code === 'P2025') return reply.code(404).send({ message: 'Post not found' });
      reply.code(400).send({ message: e?.message || 'Failed to delete' });
    }
  });
}
