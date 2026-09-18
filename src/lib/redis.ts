import { Redis } from '@upstash/redis';

// Initialize Redis client
// This will automatically use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from .env.local
// Export a getter function so it doesn't crash on import if env vars are missing
export const getRedisClient = () => {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
};
