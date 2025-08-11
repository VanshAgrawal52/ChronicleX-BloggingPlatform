import { ReactionType } from '@prisma/client';
export declare class ReactionService {
    react(postId: string, userId: string, type: ReactionType): Promise<{
        type: import("@prisma/client").$Enums.ReactionType;
        id: string;
        createdAt: Date;
        postId: string;
        userId: string;
    }>;
}
