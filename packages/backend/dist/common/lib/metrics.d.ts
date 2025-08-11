import client from 'prom-client';
export declare const httpRequestDuration: client.Histogram<"status" | "method" | "route">;
export declare function metricsRoute(): (_req: any, reply: any) => Promise<void>;
