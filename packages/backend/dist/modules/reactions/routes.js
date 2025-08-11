"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactionRoutes = reactionRoutes;
const service_js_1 = require("./service.js");
const auth_1 = require("../../common/middleware/auth");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
async function reactionRoutes(app) {
    const service = new service_js_1.ReactionService();
    const reactSchema = zod_1.z.object({ type: zod_1.z.nativeEnum(client_1.ReactionType) });
    app.post('/api/posts/:postId/reactions', { preHandler: (0, auth_1.authGuard)(['AUTHOR', 'ADMIN', 'READER']) }, async (req, reply) => {
        const user = req.user;
        const { postId } = req.params;
        const { type } = reactSchema.parse(req.body);
        const r = await service.react(postId, user.sub, type);
        reply.code(201).send(r);
    });
}
//# sourceMappingURL=routes.js.map