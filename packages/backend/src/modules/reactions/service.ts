import { prisma } from '@common/lib/prisma';
import { cacheInvalidate } from '@common/lib/cache';
import { ReactionType } from '@prisma/client';

export class ReactionService {
  async react(postId: string, userId: string, type: ReactionType) {
    const r = await prisma.reaction.upsert({
      where: { postId_userId_type: { postId, userId, type } },
      update: {},
      create: { postId, userId, type }
    });
    await cacheInvalidate('posts:slug:');
    return r;
  }
}
