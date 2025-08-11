"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const prisma_1 = require("../../common/lib/prisma");
const cache_1 = require("../../common/lib/cache");
const slugify_1 = __importDefault(require("slugify"));
class PostService {
    async list(page = 1, pageSize = 10, search, tag) {
        const cacheKey = `posts:list:${page}:${pageSize}:${search || ''}:${tag || ''}`;
        const cached = await (0, cache_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
        const where = { published: true };
        if (search)
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } }
            ];
        if (tag)
            where.tags = { some: { tag: { name: tag } } };
        const [items, total] = await Promise.all([
            prisma_1.prisma.post.findMany({
                where,
                orderBy: { publishedAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { author: true, tags: { include: { tag: true } } }
            }),
            prisma_1.prisma.post.count({ where })
        ]);
        const result = { items, total, page, pageSize };
        await (0, cache_1.cacheSet)(cacheKey, result, 30);
        return result;
    }
    async getBySlug(slug) {
        const cacheKey = `posts:slug:${slug}`;
        const cached = await (0, cache_1.cacheGet)(cacheKey);
        if (cached)
            return cached;
        const post = await prisma_1.prisma.post.findUnique({ where: { slug }, include: { author: true, comments: true, tags: { include: { tag: true } }, reactions: true } });
        if (post) {
            const reactionCounts = post.reactions.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {});
            post.reactionCounts = reactionCounts;
        }
        if (post)
            await (0, cache_1.cacheSet)(cacheKey, post, 60);
        return post;
    }
    async create(authorId, title, content, tags) {
        let base = slugify_1.default.default ? slugify_1.default.default(title, { lower: true, strict: true }) : slugify_1.default(title, { lower: true, strict: true });
        if (!base)
            base = 'post';
        let slug = base;
        let i = 1;
        while (await prisma_1.prisma.post.findUnique({ where: { slug } })) {
            i += 1;
            slug = `${base}-${i}`;
        }
        const created = await prisma_1.prisma.post.create({
            data: {
                slug,
                title,
                content,
                authorId,
                tags: { create: tags.map(name => ({ tag: { connectOrCreate: { where: { name }, create: { name } } } })) }
            }
        });
        await (0, cache_1.cacheInvalidate)('posts:list:');
        return created;
    }
    async publish(postId, requestingUserId, isAdmin) {
        const post = await prisma_1.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            throw new Error('Post not found');
        if (!isAdmin && post.authorId !== requestingUserId)
            throw new Error('Forbidden');
        if (post.published)
            return post;
        const updated = await prisma_1.prisma.post.update({ where: { id: postId }, data: { published: true, publishedAt: new Date() } });
        await (0, cache_1.cacheInvalidate)('posts:list:');
        await (0, cache_1.cacheInvalidate)(`posts:slug:${updated.slug}`);
        return updated;
    }
    async remove(postId) {
        await prisma_1.prisma.post.delete({ where: { id: postId } });
        await (0, cache_1.cacheInvalidate)('posts:list:');
    }
}
exports.PostService = PostService;
//# sourceMappingURL=service.js.map