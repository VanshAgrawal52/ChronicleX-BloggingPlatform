"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRoutes = commentRoutes;
const service_js_1 = require("./service.js");
const auth_1 = require("../../common/middleware/auth");
const commentsChannel_js_1 = require("../ws/commentsChannel.js");
const zod_1 = require("zod");
async function commentRoutes(app) {
    const service = new service_js_1.CommentService();
    app.get('/api/posts/:postId/comments', async (req, reply) => {
        const { postId } = req.params;
        reply.send(await service.list(postId));
    });
    const commentSchema = zod_1.z.object({ content: zod_1.z.string().min(1), parentId: zod_1.z.string().optional() });
    app.post('/api/posts/:postId/comments', { preHandler: (0, auth_1.authGuard)(['AUTHOR', 'ADMIN', 'READER']) }, async (req, reply) => {
        const user = req.user;
        const { postId } = req.params;
        const { content, parentId } = commentSchema.parse(req.body);
        const c = await service.add(postId, user.sub, content, parentId);
        (0, commentsChannel_js_1.broadcastComment)(postId, c);
        reply.code(201).send(c);
    });
}
//# sourceMappingURL=routes.js.map