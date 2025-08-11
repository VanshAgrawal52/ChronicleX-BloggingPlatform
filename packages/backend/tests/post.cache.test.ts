/* eslint-env jest */
import { PostService } from '../src/modules/posts/service';

jest.mock('../src/common/lib/prisma', () => {
  const posts: any[] = [
    { id: '1', slug: 'cached', title: 'Cached', content: 'cached', published: true, publishedAt: new Date(), author: { id: 'u1', name: 'User1' }, tags: [], reactions: [], comments: [], createdAt: new Date(), updatedAt: new Date() }
  ];
  return {
    prisma: {
      post: {
        findMany: jest.fn(async () => posts),
        count: jest.fn(async () => posts.length),
        findUnique: jest.fn(async ({ where: { slug } }: any) => posts.find(p => p.slug === slug) || null),
        create: jest.fn(async ({ data }: any) => { const p = { ...data, id: String(posts.length+1), published: true, publishedAt: new Date(), author: { id: data.authorId }, tags: [], reactions: [], comments: [], createdAt: new Date(), updatedAt: new Date() }; posts.push(p); return p; })
      }
    }
  };
});
import * as cache from '../src/common/lib/cache';

jest.spyOn(cache, 'cacheGet').mockImplementation(async () => null);
jest.spyOn(cache, 'cacheSet').mockImplementation(async () => {});
jest.spyOn(cache, 'cacheInvalidate').mockImplementation(async () => {});

describe('PostService list', () => {
  it('returns pagination object', async () => {
    const svc = new PostService();
    const res = await svc.list(1, 1);
    expect(res).toHaveProperty('items');
    expect(res).toHaveProperty('total');
    expect(res).toHaveProperty('page', 1);
  });
});
