import { prisma } from '@common/lib/prisma';
import { PostService } from '../posts/service.js';
import { env } from '@config/env';
import jwt from 'jsonwebtoken';
import { ReactionService } from '../reactions/service.js';
import { CommentService } from '../comments/service.js';
import DataLoader from 'dataloader';

export const typeDefs = `
  type User { id: ID! email: String! username: String! role: String! }
  type ReactionCount { type: String! count: Int! }
  type Comment { id: ID! content: String! authorId: String! postId: String! createdAt: String! parentId: String }
  type Post {
    id: ID!
    slug: String!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    createdAt: String!
    reactionCounts: [ReactionCount!]!
    comments(limit: Int = 20): [Comment!]!
  }
  type PostList { items: [Post!]! total: Int! page: Int! pageSize: Int! }

  type Mutation {
    createPost(title: String!, content: String!, tags: [String!]): Post!
    publishPost(id: ID!): Post!
    react(postId: ID!, type: String!): Boolean!
    addComment(postId: ID!, content: String!, parentId: ID): Comment!
  }
  type Query {
    posts(page: Int, pageSize: Int, search: String, tag: String): PostList!
    post(slug: String!): Post
  }
`;

const postService = new PostService();

export const resolvers = {
  Query: {
    posts: async (_: any, args: any) => {
      return postService.list(args.page ?? 1, args.pageSize ?? 10, args.search, args.tag);
    },
    post: async (_: any, args: any) => postService.getBySlug(args.slug)
  },
  Post: {
    author: (parent: any, _args: any, ctx: any) => ctx.loaders.user.load(parent.authorId),
    reactionCounts: async (parent: any) => {
      if (parent.reactionCounts) {
        return Object.entries(parent.reactionCounts).map(([type, count]) => ({ type, count }));
      }
      const grouped = await prisma.reaction.groupBy({ by: ['type'], where: { postId: parent.id }, _count: { _all: true } });
      return grouped.map(g => ({ type: g.type, count: (g as any)._count._all }));
    },
    comments: (parent: any, args: any) => prisma.comment.findMany({ where: { postId: parent.id }, orderBy: { createdAt: 'asc' }, take: args.limit ?? 20 })
  }
  ,Mutation: {
    createPost: async (_: any, args: any, ctx: any) => {
      const userId = (ctx.request as any).user?.sub;
      if (!userId) throw new Error('Unauthorized');
      return postService.create(userId, args.title, args.content, args.tags || []);
    },
    publishPost: async (_: any, args: any, ctx: any) => {
      const user = (ctx.request as any).user;
      if (!user) throw new Error('Unauthorized');
      const updated = await postService.publish(args.id, user.sub, user.role === 'ADMIN');
      return updated;
    },
    react: async (_: any, args: any, ctx: any) => {
      const userId = (ctx.request as any).user?.sub;
      if (!userId) throw new Error('Unauthorized');
      const rs = new ReactionService();
      await rs.react(args.postId, userId, args.type);
      return true;
    },
    addComment: async (_: any, args: any, ctx: any) => {
      const userId = (ctx.request as any).user?.sub;
      if (!userId) throw new Error('Unauthorized');
      const cs = new CommentService();
      return cs.add(args.postId, userId, args.content, args.parentId);
    }
  }
};

export function buildContext(request: any, reply: any) {
  const auth = request.headers.authorization as string | undefined;
  if (auth?.startsWith('Bearer ')) {
    try { (request as any).user = jwt.verify(auth.slice(7), env.JWT_SECRET); } catch { /* ignore */ }
  }
  // DataLoaders
  const userLoader = new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({ where: { id: { in: ids as string[] } } });
    const map = new Map(users.map(u => [u.id, u]));
    return ids.map(id => map.get(id) || null);
  });
  return { prisma, request, reply, loaders: { user: userLoader } };
}
