import { FastifyInstance } from 'fastify';
import { AuthService } from './service.js';
import { z } from 'zod';

const registerSchema = z.object({ email: z.string().email(), username: z.string().min(3), password: z.string().min(8) });
const registerAdminSchema = z.object({ email: z.string().email(), username: z.string().min(3), password: z.string().min(8), invite: z.string().min(8) });
const loginSchema = z.object({ identifier: z.string(), password: z.string() });
const refreshSchema = z.object({ refreshToken: z.string() });

export async function authRoutes(app: FastifyInstance) {
  const service = new AuthService();

  app.post('/api/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3 },
            password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (req, reply) => {
    const { email, username, password } = registerSchema.parse(req.body);
    const tokens = await service.register(email, username, password);
    reply.send(tokens);
  });

  app.post('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string' },
          password: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    const { identifier, password } = loginSchema.parse(req.body);
    const tokens = await service.login(identifier, password);
    reply.send(tokens);
  });

  app.post('/api/auth/register-admin', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'username', 'password', 'invite'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', minLength: 3 },
          password: { type: 'string', minLength: 8 },
          invite: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const { email, username, password, invite } = registerAdminSchema.parse(req.body);
      const tokens = await service.registerAdmin(email, username, password, invite);
      reply.send(tokens);
    } catch (e: any) {
      if (e.message === 'Forbidden') return reply.code(403).send({ message: 'Forbidden' });
      throw e;
    }
  });

  app.post('/api/auth/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } }
      }
    }
  }, async (req, reply) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const tokens = service.refresh(refreshToken);
    reply.send(tokens);
  });
}
