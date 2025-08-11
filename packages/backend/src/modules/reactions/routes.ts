import { FastifyInstance } from 'fastify';
import { ReactionService } from './service.js';
import { authGuard } from '@common/middleware/auth';
import { ReactionType } from '@prisma/client';
import { z } from 'zod';

export async function reactionRoutes(app: FastifyInstance) {
  const service = new ReactionService();
  const reactSchema = z.object({ type: z.nativeEnum(ReactionType) });
  app.post('/api/posts/:postId/reactions', { preHandler: authGuard(['AUTHOR','ADMIN','READER']) }, async (req, reply) => {
    const user = (req as any).user;
    const { postId } = req.params as any;
    const { type } = reactSchema.parse(req.body);
    const r = await service.react(postId, user.sub, type);
    reply.code(201).send(r);
  });
}
