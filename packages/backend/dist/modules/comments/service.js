"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const prisma_1 = require("../../common/lib/prisma");
const cache_1 = require("../../common/lib/cache");
class CommentService {
    async add(postId, authorId, content, parentId) {
        const comment = await prisma_1.prisma.comment.create({ data: { postId, authorId, content, parentId } });
        await (0, cache_1.cacheInvalidate)('posts:slug:');
        return comment;
    }
    async list(postId) {
        return prisma_1.prisma.comment.findMany({ where: { postId }, orderBy: { createdAt: 'asc' } });
    }
}
exports.CommentService = CommentService;
//# sourceMappingURL=service.js.map