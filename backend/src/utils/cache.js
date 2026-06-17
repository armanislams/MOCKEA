import { createClient } from 'redis';

let redisClient = null;
let isRedisConnected = false;

// Local in-memory fallback cache Map
const localCache = new Map();

// Periodic cleanup: evict expired entries every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of localCache) {
    if (entry.expiresAt <= now) {
      localCache.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

// Initialize Redis client
const initRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.warn("REDIS_URL not configured. Using local in-memory fallback cache.");
        return;
    }

    try {
        redisClient = createClient({
            url: process.env.REDIS_URL
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
            isRedisConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('Connecting to Redis...');
        });

        redisClient.on('ready', () => {
            console.log('Redis client is ready and connected.');
            isRedisConnected = true;
        });

        await redisClient.connect();
    } catch (err) {
        console.error("Failed to connect to Redis. Falling back to in-memory cache.", err.message);
        isRedisConnected = false;
    }
};

// Start initialization immediately
initRedis();

export const cache = {
    get: async (key) => {
        if (isRedisConnected && redisClient) {
            try {
                const data = await redisClient.get(key);
                return data ? JSON.parse(data) : null;
            } catch (err) {
                console.error(`Error reading key ${key} from Redis:`, err);
            }
        }
        // Fallback to local in-memory cache
        const localData = localCache.get(key);
        if (localData) {
            if (localData.expiresAt > Date.now()) {
                return localData.value;
            } else {
                localCache.delete(key);
            }
        }
        return null;
    },

    set: async (key, value, ttl = 300) => {
        if (isRedisConnected && redisClient) {
            try {
                await redisClient.set(key, JSON.stringify(value), {
                    EX: ttl
                });
                return;
            } catch (err) {
                console.error(`Error setting key ${key} in Redis:`, err);
            }
        }
        // Fallback to local in-memory cache
        localCache.set(key, {
            value,
            expiresAt: Date.now() + (ttl * 1000)
        });
    },

    del: async (key) => {
        if (isRedisConnected && redisClient) {
            try {
                await redisClient.del(key);
                return;
            } catch (err) {
                console.error(`Error deleting key ${key} from Redis:`, err);
            }
        }
        // Fallback to local in-memory cache
        localCache.delete(key);
    },

    clear: async () => {
        if (isRedisConnected && redisClient) {
            try {
                await redisClient.flushDb();
                return;
            } catch (err) {
                console.error('Error clearing Redis cache:', err);
            }
        }
        localCache.clear();
    }
};
