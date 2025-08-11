import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export interface AuthUser { sub: string; role: string }

export function authGuard(roles?: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return reply.code(401).send({ message: 'Unauthorized' });
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser;
      (req as any).user = payload;
      if (roles && roles.length && !roles.includes(payload.role)) {
        return reply.code(403).send({ message: 'Forbidden' });
      }
    } catch {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
  };
}
