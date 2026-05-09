import Redis from 'ioredis';

const globalForRedis = global;

function createRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const client = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: false,
  });
  client.on('error', (err) => {
    console.warn('[redis] error:', err.message);
  });
  return client;
}

export const redis = globalForRedis.redis || createRedis();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
