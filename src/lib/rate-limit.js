import redis from './redis';

// Redis 기반 sliding-window-lite rate limit.
// Redis 미가용 시 fail-open(통과)으로 정상 사용자 차단 방지.
//
// 사용 예: const r = await rateLimit({ key: `signup:${ip}`, max: 3, windowSec: 60 });
//          if (!r.ok) return 429;
export async function rateLimit({ key, max, windowSec }) {
  if (!redis || redis.status === 'end' || redis.status === 'close') {
    return { ok: true, count: 0, remaining: max, degraded: true };
  }
  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec);
    }
    return {
      ok: count <= max,
      count,
      remaining: Math.max(0, max - count),
    };
  } catch (err) {
    console.warn('[rate-limit] redis error, fail-open:', err.message);
    return { ok: true, count: 0, remaining: max, degraded: true };
  }
}
