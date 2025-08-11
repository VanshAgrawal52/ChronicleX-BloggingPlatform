"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authGuard = authGuard;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
function authGuard(roles) {
    return async (req, reply) => {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer '))
            return reply.code(401).send({ message: 'Unauthorized' });
        const token = header.slice(7);
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = payload;
            if (roles && roles.length && !roles.includes(payload.role)) {
                return reply.code(403).send({ message: 'Forbidden' });
            }
        }
        catch {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
    };
}
//# sourceMappingURL=auth.js.map