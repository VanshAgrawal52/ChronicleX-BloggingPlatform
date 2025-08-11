import { FastifyInstance } from 'fastify';
import { authRoutes } from '../auth/routes.js';
import { postRoutes } from '../posts/routes.js';
import { commentRoutes } from '../comments/routes.js';
import { reactionRoutes } from '../reactions/routes.js';
import { uploadRoutes } from '../uploads/routes.js';

export async function registerRoutes(app: FastifyInstance) {
  await authRoutes(app);
  await postRoutes(app);
  await commentRoutes(app);
  await reactionRoutes(app);
  await uploadRoutes(app);
}
