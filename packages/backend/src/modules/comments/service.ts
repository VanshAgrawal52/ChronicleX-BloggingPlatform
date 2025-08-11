import { prisma } from '@common/lib/prisma';
import { cacheInvalidate } from '@common/lib/cache';

export class CommentService {
  async add(postId: string, authorId: string, content: string, parentId?: string) {
    const comment = await prisma.comment.create({ data: { postId, authorId, content, parentId } });
    await cacheInvalidate('posts:slug:');
    return comment;
  }
  async list(postId: string) {
    return prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' } });
  }
}
