import { FastifyRequest, FastifyReply } from 'fastify';
export interface AuthUser {
    sub: string;
    role: string;
}
export declare function authGuard(roles?: string[]): (req: FastifyRequest, reply: FastifyReply) => Promise<undefined>;
