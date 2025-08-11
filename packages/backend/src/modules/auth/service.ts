import { prisma } from '@common/lib/prisma';
import argon2 from 'argon2';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';

export class AuthService {
  async register(email: string, username: string, password: string) {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new Error('User already exists');
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({ data: { email, username, passwordHash } });
    return this.generateTokens(user.id, user.role);
  }

  async login(identifier: string, password: string) {
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new Error('Invalid credentials');
    return this.generateTokens(user.id, user.role);
  }

  async registerAdmin(email: string, username: string, password: string, invite: string) {
    if (!env.ADMIN_INVITE_SECRET || invite !== env.ADMIN_INVITE_SECRET) {
      throw new Error('Forbidden');
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new Error('User already exists');
    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({ data: { email, username, passwordHash, role: 'ADMIN' } });
    return this.generateTokens(user.id, user.role);
  }

  private generateTokens(userId: string, role: string) {
  const jwtSecret = env.JWT_SECRET as unknown as Secret;
  const accessToken = jwt.sign({ sub: userId, role } as Record<string, any>, jwtSecret, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
  const refreshToken = jwt.sign({ sub: userId, role, type: 'refresh' } as Record<string, any>, jwtSecret, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);
    return { accessToken, refreshToken };
  }

  refresh(refreshToken: string) {
    try {
  const payload = jwt.verify(refreshToken, env.JWT_SECRET as unknown as Secret) as any;
      if (payload.type !== 'refresh') throw new Error('Invalid');
      return this.generateTokens(payload.sub, payload.role);
    } catch {
      throw new Error('Invalid refresh token');
    }
  }
}
