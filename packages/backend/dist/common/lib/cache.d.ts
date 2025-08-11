export declare function cacheConnect(): Promise<void>;
export declare function cachePing(): Promise<boolean>;
export declare function cacheDisconnect(): Promise<void>;
export declare function cacheGet<T>(key: string): Promise<T | null>;
export declare function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void>;
export declare function cacheInvalidate(prefix: string): Promise<void>;
