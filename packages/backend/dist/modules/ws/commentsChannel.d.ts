export declare const commentChannels: Map<string, Set<any>>;
export declare function registerCommentSocket(postId: string, socket: any): void;
export declare function broadcastComment(postId: string, message: any): void;
