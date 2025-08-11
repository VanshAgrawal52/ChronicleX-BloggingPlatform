/* eslint-env jest */
import { PostService } from '../src/modules/posts/service';

jest.mock('../src/common/lib/prisma', () => {
  const posts: any[] = [];
  return {
    prisma: {
      post: {
        findUnique: jest.fn(async ({ where: { slug } }: any) => posts.find(p => p.slug === slug) || null),
        create: jest.fn(async ({ data }: any) => { posts.push({ ...data, id: String(posts.length+1), createdAt: new Date(), updatedAt: new Date() }); return posts[posts.length-1]; })
      }
    }
  };
});

describe('PostService.create slug uniqueness', () => {
  it('appends incrementing suffix for collisions', async () => {
    const svc = new PostService();
    const p1 = await svc.create('user1','Hello World','content',[]);
    const p2 = await svc.create('user1','Hello World','content2',[]);
    expect(p1.slug).toBe('hello-world');
    expect(p2.slug).toBe('hello-world-2');
  });
});
