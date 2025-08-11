"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheConnect = cacheConnect;
exports.cachePing = cachePing;
exports.cacheDisconnect = cacheDisconnect;
exports.cacheGet = cacheGet;
exports.cacheSet = cacheSet;
exports.cacheInvalidate = cacheInvalidate;
const redis_1 = require("redis");
const env_1 = require("../../config/env");
const isTest = env_1.env.NODE_ENV === 'test';
const noRedis = !env_1.env.REDIS_URL || env_1.env.DISABLE_REDIS;
let mem = null;
let client = null;
let connected = false;
if (isTest || noRedis) {
    mem = new Map();
}
else {
    client = (0, redis_1.createClient)({ url: env_1.env.REDIS_URL });
    client.on('error', err => console.error('Redis error', err));
}
async function cacheConnect() {
    if (isTest || noRedis)
        return;
    if (client && !connected) {
        await client.connect();
        connected = true;
    }
}
async function cachePing() {
    if (isTest)
        return true;
    try {
        await cacheConnect();
        await client.ping();
        return true;
    }
    catch {
        return false;
    }
}
async function cacheDisconnect() {
    if (isTest)
        return;
    if (client && connected) {
        try {
            await client.quit();
        }
        catch { }
        connected = false;
    }
}
async function cacheGet(key) {
    if (isTest || noRedis) {
        const entry = mem.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            mem.delete(key);
            return null;
        }
        return entry.value;
    }
    await cacheConnect();
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
}
async function cacheSet(key, value, ttlSeconds = 60) {
    if (isTest || noRedis) {
        mem.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
        return;
    }
    await cacheConnect();
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
}
async function cacheInvalidate(prefix) {
    if (isTest || noRedis) {
        for (const k of Array.from(mem.keys()))
            if (k.startsWith(prefix))
                mem.delete(k);
        return;
    }
    await cacheConnect();
    const keys = await client.keys(prefix + '*');
    if (keys.length)
        await client.del(keys);
}
//# sourceMappingURL=cache.js.map