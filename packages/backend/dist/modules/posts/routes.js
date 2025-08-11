"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoutes = postRoutes;
const service_js_1 = require("./service.js");
const auth_1 = require("../../common/middleware/auth");
const zod_1 = require("zod");
async function postRoutes(app) {
    const service = new service_js_1.PostService();
    app.get('/api/posts', async (req, reply) => {
        const { page = '1', pageSize = '10', search, tag } = req.query;
        const result = await service.list(Number(page), Number(pageSize), search, tag);
        reply.send(result);
    });
    app.get('/api/posts/:slug', async (req, reply) => {
        const { slug } = req.params;
        const post = await service.getBySlug(slug);
        if (!post)
            return reply.code(404).send({ message: 'Not found' });
        reply.send(post);
    });
    const createSchema = zod_1.z.object({ title: zod_1.z.string().min(3), content: zod_1.z.string().min(1), tags: zod_1.z.array(zod_1.z.string()).optional() });
    app.post('/api/posts', { preHandler: (0, auth_1.authGuard)(['READER', 'AUTHOR', 'ADMIN']) }, async (req, reply) => {
        const user = req.user;
        const { title, content, tags = [] } = createSchema.parse(req.body);
        const created = await service.create(user.sub, title, content, tags);
        reply.code(201).send(created);
    });
    app.post('/api/posts/:id/publish', { preHandler: (0, auth_1.authGuard)(['READER', 'AUTHOR', 'ADMIN']) }, async (req, reply) => {
        const user = req.user;
        const { id } = req.params;
        try {
            const updated = await service.publish(id, user.sub, user.role === 'ADMIN');
            reply.send(updated);
        }
        catch (e) {
            if (e.message === 'Post not found')
                return reply.code(404).send({ message: e.message });
            if (e.message === 'Forbidden')
                return reply.code(403).send({ message: e.message });
            reply.code(400).send({ message: e.message });
        }
    });
    app.delete('/api/posts/:id', { preHandler: (0, auth_1.authGuard)(['ADMIN']) }, async (req, reply) => {
        const { id } = req.params;
        try {
            await service.remove(id);
            reply.send({ ok: true });
        }
        catch (e) {
            if (e.code === 'P2025')
                return reply.code(404).send({ message: 'Post not found' });
            reply.code(400).send({ message: e?.message || 'Failed to delete' });
        }
    });
}
//# sourceMappingURL=routes.js.map