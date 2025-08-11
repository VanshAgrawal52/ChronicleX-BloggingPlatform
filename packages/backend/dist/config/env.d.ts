export declare const env: {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    GRAPHQL_PLAYGROUND: boolean;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_TIME_WINDOW: number;
    QUEUE_ENABLE: boolean;
    REDIS_URL?: string | undefined;
    ADMIN_INVITE_SECRET?: string | undefined;
    CORS_ORIGINS?: string | undefined;
    DISABLE_REDIS?: boolean | undefined;
};
