"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const service_js_1 = require("./service.js");
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({ email: zod_1.z.string().email(), username: zod_1.z.string().min(3), password: zod_1.z.string().min(8) });
const registerAdminSchema = zod_1.z.object({ email: zod_1.z.string().email(), username: zod_1.z.string().min(3), password: zod_1.z.string().min(8), invite: zod_1.z.string().min(8) });
const loginSchema = zod_1.z.object({ identifier: zod_1.z.string(), password: zod_1.z.string() });
const refreshSchema = zod_1.z.object({ refreshToken: zod_1.z.string() });
async function authRoutes(app) {
    const service = new service_js_1.AuthService();
    app.post('/api/auth/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'username', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string', minLength: 3 },
                    password: { type: 'string', minLength: 8 }
                }
            }
        }
    }, async (req, reply) => {
        const { email, username, password } = registerSchema.parse(req.body);
        const tokens = await service.register(email, username, password);
        reply.send(tokens);
    });
    app.post('/api/auth/login', {
        schema: {
            body: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                    identifier: { type: 'string' },
                    password: { type: 'string' }
                }
            }
        }
    }, async (req, reply) => {
        const { identifier, password } = loginSchema.parse(req.body);
        const tokens = await service.login(identifier, password);
        reply.send(tokens);
    });
    app.post('/api/auth/register-admin', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'username', 'password', 'invite'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string', minLength: 3 },
                    password: { type: 'string', minLength: 8 },
                    invite: { type: 'string', minLength: 8 }
                }
            }
        }
    }, async (req, reply) => {
        try {
            const { email, username, password, invite } = registerAdminSchema.parse(req.body);
            const tokens = await service.registerAdmin(email, username, password, invite);
            reply.send(tokens);
        }
        catch (e) {
            if (e.message === 'Forbidden')
                return reply.code(403).send({ message: 'Forbidden' });
            throw e;
        }
    });
    app.post('/api/auth/refresh', {
        schema: {
            body: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } }
            }
        }
    }, async (req, reply) => {
        const { refreshToken } = refreshSchema.parse(req.body);
        const tokens = service.refresh(refreshToken);
        reply.send(tokens);
    });
}
//# sourceMappingURL=routes.js.map