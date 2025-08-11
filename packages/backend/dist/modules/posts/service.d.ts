export declare class PostService {
    list(page?: number, pageSize?: number, search?: string, tag?: string): Promise<any>;
    getBySlug(slug: string): Promise<any>;
    create(authorId: string, title: string, content: string, tags: string[]): Promise<{
        id: string;
        slug: string;
        title: string;
        content: string;
        published: boolean;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    publish(postId: string, requestingUserId: string, isAdmin: boolean): Promise<{
        id: string;
        slug: string;
        title: string;
        content: string;
        published: boolean;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date | null;
    }>;
    remove(postId: string): Promise<void>;
}
