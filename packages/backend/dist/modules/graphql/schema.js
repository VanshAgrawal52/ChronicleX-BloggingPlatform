"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
exports.buildContext = buildContext;
const prisma_1 = require("../../common/lib/prisma");
const service_js_1 = require("../posts/service.js");
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const service_js_2 = require("../reactions/service.js");
const service_js_3 = require("../comments/service.js");
const dataloader_1 = __importDefault(require("dataloader"));
exports.typeDefs = `
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
const postService = new service_js_1.PostService();
exports.resolvers = {
    Query: {
        posts: async (_, args) => {
            return postService.list(args.page ?? 1, args.pageSize ?? 10, args.search, args.tag);
        },
        post: async (_, args) => postService.getBySlug(args.slug)
    },
    Post: {
        author: (parent, _args, ctx) => ctx.loaders.user.load(parent.authorId),
        reactionCounts: async (parent) => {
            if (parent.reactionCounts) {
                return Object.entries(parent.reactionCounts).map(([type, count]) => ({ type, count }));
            }
            const grouped = await prisma_1.prisma.reaction.groupBy({ by: ['type'], where: { postId: parent.id }, _count: { _all: true } });
            return grouped.map(g => ({ type: g.type, count: g._count._all }));
        },
        comments: (parent, args) => prisma_1.prisma.comment.findMany({ where: { postId: parent.id }, orderBy: { createdAt: 'asc' }, take: args.limit ?? 20 })
    },
    Mutation: {
        createPost: async (_, args, ctx) => {
            const userId = ctx.request.user?.sub;
            if (!userId)
                throw new Error('Unauthorized');
            return postService.create(userId, args.title, args.content, args.tags || []);
        },
        publishPost: async (_, args, ctx) => {
            const user = ctx.request.user;
            if (!user)
                throw new Error('Unauthorized');
            const updated = await postService.publish(args.id, user.sub, user.role === 'ADMIN');
            return updated;
        },
        react: async (_, args, ctx) => {
            const userId = ctx.request.user?.sub;
            if (!userId)
                throw new Error('Unauthorized');
            const rs = new service_js_2.ReactionService();
            await rs.react(args.postId, userId, args.type);
            return true;
        },
        addComment: async (_, args, ctx) => {
            const userId = ctx.request.user?.sub;
            if (!userId)
                throw new Error('Unauthorized');
            const cs = new service_js_3.CommentService();
            return cs.add(args.postId, userId, args.content, args.parentId);
        }
    }
};
function buildContext(request, reply) {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
        try {
            request.user = jsonwebtoken_1.default.verify(auth.slice(7), env_1.env.JWT_SECRET);
        }
        catch { }
    }
    const userLoader = new dataloader_1.default(async (ids) => {
        const users = await prisma_1.prisma.user.findMany({ where: { id: { in: ids } } });
        const map = new Map(users.map(u => [u.id, u]));
        return ids.map(id => map.get(id) || null);
    });
    return { prisma: prisma_1.prisma, request, reply, loaders: { user: userLoader } };
}
//# sourceMappingURL=schema.js.map