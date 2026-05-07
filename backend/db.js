/**
 * In-memory cache for FlockWatch follower/following data.
 * Keyed by userId, expires after 15 minutes.
 */

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const cache = new Map(); // userId → { followers, following, cachedAt }

/**
 * Retrieve cached data for a userId. Returns null if missing or expired.
 */
export function getCache(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;

  const age = Date.now() - entry.cachedAt;
  if (age > CACHE_TTL_MS) {
    cache.delete(userId);
    return null;
  }

  return entry;
}

/**
 * Store follower/following data for a userId.
 */
export function setCache(userId, data) {
  cache.set(userId, {
    followers: data.followers || [],
    following: data.following || [],
    cachedAt: Date.now(),
  });
}

/**
 * Clear cached data for a userId.
 */
export function clearCache(userId) {
  cache.delete(userId);
}

/**
 * Return cache age in seconds, or null if not cached.
 */
export function getCacheAge(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;
  return Math.floor((Date.now() - entry.cachedAt) / 1000);
}
