import { PostService } from '../src/modules/posts/service';

// Mock prisma to avoid real DB dependency
jest.mock('../src/common/lib/prisma', () => {
  const posts: any[] = [
    { id: '1', slug: 'example', title: 'Example', content: 'example', published: true, publishedAt: new Date(), author: { id: 'u1', name: 'User1' }, tags: [], reactions: [], comments: [], createdAt: new Date(), updatedAt: new Date() }
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

describe('PostService cache key', () => {
  it('builds list and returns pagination structure', async () => {
    const svc = new PostService();
    // Note: this hits DB; in real test mock prisma.
    const res = await svc.list(1, 1);
    expect(res).toHaveProperty('items');
    expect(res).toHaveProperty('total');
  });
});
