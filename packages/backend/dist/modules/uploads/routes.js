"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = uploadRoutes;
const auth_1 = require("../../common/middleware/auth");
async function uploadRoutes(app) {
    app.post('/api/uploads/presign', { preHandler: (0, auth_1.authGuard)(['AUTHOR', 'ADMIN']) }, async (_req, reply) => {
        reply.send({ url: 'https://example.com/upload', fields: { key: 'placeholder' }, expiresIn: 300 });
    });
}
//# sourceMappingURL=routes.js.map