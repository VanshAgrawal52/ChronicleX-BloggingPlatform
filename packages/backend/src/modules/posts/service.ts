import { prisma } from '@common/lib/prisma';
import { cacheGet, cacheSet, cacheInvalidate } from '@common/lib/cache';
import slugifyLib from 'slugify';

export class PostService {
  async list(page = 1, pageSize = 10, search?: string, tag?: string) {
    const cacheKey = `posts:list:${page}:${pageSize}:${search || ''}:${tag || ''}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;
    const where: any = { published: true };
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
    if (tag) where.tags = { some: { tag: { name: tag } } };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: true, tags: { include: { tag: true } } }
      }),
      prisma.post.count({ where })
    ]);
  const result = { items, total, page, pageSize };
  await cacheSet(cacheKey, result, 30);
  return result;
  }

  async getBySlug(slug: string) {
  const cacheKey = `posts:slug:${slug}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return cached;
    const post = await prisma.post.findUnique({ where: { slug }, include: { author: true, comments: true, tags: { include: { tag: true } }, reactions: true } });
    if (post) {
      const reactionCounts = post.reactions.reduce((acc: any, r: any) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
      (post as any).reactionCounts = reactionCounts;
    }
  if (post) await cacheSet(cacheKey, post, 60);
  return post;
  }

  async create(authorId: string, title: string, content: string, tags: string[]) {
    let base = (slugifyLib as any).default ? (slugifyLib as any).default(title, { lower: true, strict: true }) : (slugifyLib as any)(title, { lower: true, strict: true });
    if (!base) base = 'post';
    let slug = base;
    let i = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      i += 1;
      slug = `${base}-${i}`;
    }
    const created = await prisma.post.create({
      data: {
        slug,
        title,
        content,
        authorId,
        tags: { create: tags.map(name => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) }
      }
    });
    await cacheInvalidate('posts:list:');
    return created;
  }

  async publish(postId: string, requestingUserId: string, isAdmin: boolean) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (!isAdmin && post.authorId !== requestingUserId) throw new Error('Forbidden');
    if (post.published) return post; // already published
    const updated = await prisma.post.update({ where: { id: postId }, data: { published: true, publishedAt: new Date() } });
    await cacheInvalidate('posts:list:');
    await cacheInvalidate(`posts:slug:${updated.slug}`);
    return updated;
  }

  async remove(postId: string) {
    // Will throw if not found
    await prisma.post.delete({ where: { id: postId } });
    await cacheInvalidate('posts:list:');
  }
}
