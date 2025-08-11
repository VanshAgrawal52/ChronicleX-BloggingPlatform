"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerErrorHandler = registerErrorHandler;
const zod_1 = require("zod");
function registerErrorHandler(app) {
    app.setErrorHandler((err, _req, reply) => {
        if (err instanceof zod_1.ZodError) {
            return reply.code(400).send({ error: 'VALIDATION_ERROR', details: err.flatten() });
        }
        if (err.validation) {
            return reply.code(400).send({ error: 'VALIDATION_ERROR', details: err.validation });
        }
        const status = err.statusCode || 500;
        reply.code(status).send({ error: err.name || 'Error', message: err.message || 'Internal Server Error' });
    });
}
//# sourceMappingURL=errors.js.map