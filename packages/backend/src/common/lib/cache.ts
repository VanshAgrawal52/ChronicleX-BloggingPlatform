import { createClient } from 'redis';
import { env } from '@config/env';

const isTest = env.NODE_ENV === 'test';
const noRedis = !env.REDIS_URL || env.DISABLE_REDIS; // allow running without redis in dev
let mem: Map<string, { value: any; expiresAt: number | null }> | null = null;
let client: ReturnType<typeof createClient> | null = null;
let connected = false;

if (isTest || noRedis) {
  mem = new Map();
} else {
  client = createClient({ url: env.REDIS_URL });
  client.on('error', err => console.error('Redis error', err));
}

export async function cacheConnect() {
  if (isTest || noRedis) return; // no-op
  if (client && !connected) { await client.connect(); connected = true; }
}

export async function cachePing(): Promise<boolean> {
  if (isTest) return true;
  try {
    await cacheConnect();
    await client!.ping();
    return true;
  } catch {
    return false;
  }
}

export async function cacheDisconnect() {
  if (isTest) return;
  if (client && connected) {
    try { await client.quit(); } catch { /* ignore */ }
    connected = false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (isTest || noRedis) {
    const entry = mem!.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) { mem!.delete(key); return null; }
    return entry.value as T;
  }
  await cacheConnect();
  const val = await client!.get(key);
  return val ? JSON.parse(val) as T : null;
}

export async function cacheSet(key: string, value: any, ttlSeconds = 60) {
  if (isTest || noRedis) {
    mem!.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
    return;
  }
  await cacheConnect();
  await client!.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function cacheInvalidate(prefix: string) {
  if (isTest || noRedis) {
    for (const k of Array.from(mem!.keys())) if (k.startsWith(prefix)) mem!.delete(k);
    return;
  }
  await cacheConnect();
  const keys = await client!.keys(prefix + '*');
  if (keys.length) await client!.del(keys);
}
