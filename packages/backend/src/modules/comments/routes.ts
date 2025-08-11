import { FastifyInstance } from 'fastify';
import { CommentService } from './service.js';
import { authGuard } from '@common/middleware/auth';
import { broadcastComment } from '../ws/commentsChannel.js';
import { z } from 'zod';

export async function commentRoutes(app: FastifyInstance) {
  const service = new CommentService();
  app.get('/api/posts/:postId/comments', async (req, reply) => {
    const { postId } = req.params as any;
    reply.send(await service.list(postId));
  });
  const commentSchema = z.object({ content: z.string().min(1), parentId: z.string().optional() });
  app.post('/api/posts/:postId/comments', { preHandler: authGuard(['AUTHOR','ADMIN','READER']) }, async (req, reply) => {
    const user = (req as any).user;
    const { postId } = req.params as any;
    const { content, parentId } = commentSchema.parse(req.body);
    const c = await service.add(postId, user.sub, content, parentId);
    broadcastComment(postId, c);
    reply.code(201).send(c);
  });
}
