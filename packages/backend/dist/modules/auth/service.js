"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../common/lib/prisma");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
class AuthService {
    async register(email, username, password) {
        const existing = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        if (existing)
            throw new Error('User already exists');
        const passwordHash = await argon2_1.default.hash(password);
        const user = await prisma_1.prisma.user.create({ data: { email, username, passwordHash } });
        return this.generateTokens(user.id, user.role);
    }
    async login(identifier, password) {
        const user = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
        if (!user)
            throw new Error('Invalid credentials');
        const valid = await argon2_1.default.verify(user.passwordHash, password);
        if (!valid)
            throw new Error('Invalid credentials');
        return this.generateTokens(user.id, user.role);
    }
    async registerAdmin(email, username, password, invite) {
        if (!env_1.env.ADMIN_INVITE_SECRET || invite !== env_1.env.ADMIN_INVITE_SECRET) {
            throw new Error('Forbidden');
        }
        const existing = await prisma_1.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        if (existing)
            throw new Error('User already exists');
        const passwordHash = await argon2_1.default.hash(password);
        const user = await prisma_1.prisma.user.create({ data: { email, username, passwordHash, role: 'ADMIN' } });
        return this.generateTokens(user.id, user.role);
    }
    generateTokens(userId, role) {
        const jwtSecret = env_1.env.JWT_SECRET;
        const accessToken = jsonwebtoken_1.default.sign({ sub: userId, role }, jwtSecret, { expiresIn: env_1.env.JWT_EXPIRES_IN });
        const refreshToken = jsonwebtoken_1.default.sign({ sub: userId, role, type: 'refresh' }, jwtSecret, { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN });
        return { accessToken, refreshToken };
    }
    refresh(refreshToken) {
        try {
            const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
            if (payload.type !== 'refresh')
                throw new Error('Invalid');
            return this.generateTokens(payload.sub, payload.role);
        }
        catch {
            throw new Error('Invalid refresh token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map