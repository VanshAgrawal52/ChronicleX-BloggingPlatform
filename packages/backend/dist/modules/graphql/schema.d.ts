import DataLoader from 'dataloader';
export declare const typeDefs = "\n  type User { id: ID! email: String! username: String! role: String! }\n  type ReactionCount { type: String! count: Int! }\n  type Comment { id: ID! content: String! authorId: String! postId: String! createdAt: String! parentId: String }\n  type Post {\n    id: ID!\n    slug: String!\n    title: String!\n    content: String!\n    author: User!\n    published: Boolean!\n    createdAt: String!\n    reactionCounts: [ReactionCount!]!\n    comments(limit: Int = 20): [Comment!]!\n  }\n  type PostList { items: [Post!]! total: Int! page: Int! pageSize: Int! }\n\n  type Mutation {\n    createPost(title: String!, content: String!, tags: [String!]): Post!\n    publishPost(id: ID!): Post!\n    react(postId: ID!, type: String!): Boolean!\n    addComment(postId: ID!, content: String!, parentId: ID): Comment!\n  }\n  type Query {\n    posts(page: Int, pageSize: Int, search: String, tag: String): PostList!\n    post(slug: String!): Post\n  }\n";
export declare const resolvers: {
    Query: {
        posts: (_: any, args: any) => Promise<any>;
        post: (_: any, args: any) => Promise<any>;
    };
    Post: {
        author: (parent: any, _args: any, ctx: any) => any;
        reactionCounts: (parent: any) => Promise<{
            type: string;
            count: unknown;
        }[] | {
            type: import("@prisma/client").$Enums.ReactionType;
            count: any;
        }[]>;
        comments: (parent: any, args: any) => import("@prisma/client").Prisma.PrismaPromise<{
            id: string;
            content: string;
            authorId: string;
            createdAt: Date;
            updatedAt: Date;
            postId: string;
            parentId: string | null;
        }[]>;
    };
    Mutation: {
        createPost: (_: any, args: any, ctx: any) => Promise<{
            id: string;
            slug: string;
            title: string;
            content: string;
            published: boolean;
            authorId: string;
            createdAt: Date;
            updatedAt: Date;
            publishedAt: Date | null;
        }>;
        publishPost: (_: any, args: any, ctx: any) => Promise<{
            id: string;
            slug: string;
            title: string;
            content: string;
            published: boolean;
            authorId: string;
            createdAt: Date;
            updatedAt: Date;
            publishedAt: Date | null;
        }>;
        react: (_: any, args: any, ctx: any) => Promise<boolean>;
        addComment: (_: any, args: any, ctx: any) => Promise<{
            id: string;
            content: string;
            authorId: string;
            createdAt: Date;
            updatedAt: Date;
            postId: string;
            parentId: string | null;
        }>;
    };
};
export declare function buildContext(request: any, reply: any): {
    prisma: import("@prisma/client").PrismaClient<{
        log: ("error" | "warn")[];
    }, "error" | "warn", import("@prisma/client/runtime/library.js").DefaultArgs>;
    request: any;
    reply: any;
    loaders: {
        user: DataLoader<string, {
            role: import("@prisma/client").$Enums.Role;
            username: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            passwordHash: string;
        } | null, string>;
    };
};
