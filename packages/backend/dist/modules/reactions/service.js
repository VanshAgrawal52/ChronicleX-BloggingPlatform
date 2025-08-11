"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionService = void 0;
const prisma_1 = require("../../common/lib/prisma");
const cache_1 = require("../../common/lib/cache");
class ReactionService {
    async react(postId, userId, type) {
        const r = await prisma_1.prisma.reaction.upsert({
            where: { postId_userId_type: { postId, userId, type } },
            update: {},
            create: { postId, userId, type }
        });
        await (0, cache_1.cacheInvalidate)('posts:slug:');
        return r;
    }
}
exports.ReactionService = ReactionService;
//# sourceMappingURL=service.js.map