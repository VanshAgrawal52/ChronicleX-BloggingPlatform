import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function run() {
  const passwordHash = await argon2.hash('AdminPass123!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@chroniclex.dev' },
    update: {},
    create: { email: 'admin@chroniclex.dev', username: 'admin', passwordHash, role: 'ADMIN' }
  });

  // Clean up old welcome posts and their dependencies if present
  const oldPosts = await prisma.post.findMany({ where: { title: { startsWith: 'Welcome Post' } }, select: { id: true } });
  if (oldPosts.length) {
    const ids = oldPosts.map(p => p.id);
    await prisma.comment.deleteMany({ where: { postId: { in: ids } } });
    await prisma.reaction.deleteMany({ where: { postId: { in: ids } } });
    await prisma.postLike.deleteMany({ where: { postId: { in: ids } } });
    await prisma.post.deleteMany({ where: { id: { in: ids } } });
  }

  const posts = [
    {
      title: 'Mastering TypeScript: Practical Patterns for Large React Apps',
      content: `<h2>Why TypeScript?</h2><p>Type safety, better DX, and refactorability. Use discriminated unions, branded types, and exhaustive checks to keep UI state honest.</p><h3>Tips</h3><ul><li>Prefer interfaces for public APIs</li><li>Use zod for runtime validation</li><li>Leverage ts-pattern for exhaustive matches</li></ul>`
    },
    {
      title: 'Building a Fastify + Prisma API: Performance Tactics',
      content: `<p>Fastify is fast by default. Add schema validation, tight plugins, and connection pooling. With Prisma, use select/include wisely and batch with DataLoader.</p>`
    },
    {
      title: 'Next.js 14 Production Checklist',
      content: `<ul><li>Static vs SSR budget</li><li>Image optimization</li><li>Headers: CSP, COOP/COEP</li><li>Edge caching</li></ul>`
    },
    {
      title: 'Effective Caching Strategies with Redis',
      content: `<p>Cache-aside, write-through, and TTL tuning. Invalidate by prefix and use event-driven busting for dependent resources.</p>`
    },
    {
      title: 'Designing a Robust Auth Flow with Refresh Tokens',
      content: `<p>Short-lived access tokens, rotating refresh tokens, and server-side token invalidation. Handle 401 with silent refresh and backoff.</p>`
    },
    {
      title: 'React Rendering Patterns: Keys, Memos, and Suspense',
      content: `<p>Practical tips for stable keys, memo boundaries, and Suspense data fetching strategies that avoid tearing.</p>`
    },
    {
      title: 'Next.js Routing and Data Fetching: App vs Pages',
      content: `<p>When to choose SSR, SSG, ISR. Handling dynamic routes and incremental regeneration with cache headers.</p>`
    },
    {
      title: 'Vue 3 Composition API in Real Projects',
      content: `<p>Composable state, watchers, and performance gotchas. Testing composables in isolation.</p>`
    },
    {
      title: 'SvelteKit: Lean Web Apps with Zero Fuss',
      content: `<p>Embrace stores and transitions. Shipping minimal JS with sensible defaults.</p>`
    },
    {
      title: 'Angular Signals and Standalone Components',
      content: `<p>Signals simplify state; standalone components reduce boilerplate. Migration strategies for large apps.</p>`
    }
  ];

  for (const p of posts) {
    const slug = slugify(p.title, { lower: true, strict: true });
    await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: p.title,
        content: p.content,
        authorId: admin.id,
        published: true,
        publishedAt: new Date()
      }
    });
  }
  console.log('Seed complete');
}

run().finally(()=>prisma.$disconnect());
