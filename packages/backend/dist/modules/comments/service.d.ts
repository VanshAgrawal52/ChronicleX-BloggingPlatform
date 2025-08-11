export declare class CommentService {
    add(postId: string, authorId: string, content: string, parentId?: string): Promise<{
        id: string;
        content: string;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        parentId: string | null;
    }>;
    list(postId: string): Promise<{
        id: string;
        content: string;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
        postId: string;
        parentId: string | null;
    }[]>;
}
