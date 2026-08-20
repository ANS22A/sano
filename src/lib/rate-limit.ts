import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// Define the expected environment variables for documentation
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (e) {
  console.error('[RateLimit] Failed to initialize Redis', e)
}

// Create isolated limiters for different actions
const limiters = {
  // Booking creation: strict limit (e.g. 3 bookings per 10 minutes)
  booking: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, '10 m'),
        analytics: true,
      })
    : null,
  
  // Slot queries: looser limit (e.g. 30 requests per minute)
  slots: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
      })
    : null,
}

/**
 * Check if the current request exceeds the rate limit.
 * Will fail open (allow) if redis is not configured or fails.
 */
export async function checkRateLimit(action: keyof typeof limiters): Promise<{ success: boolean }> {
  try {
    const limiter = limiters[action]
    // If not configured, fail safely (allow request)
    if (!limiter) return { success: true }

    // Use headers in Next.js App Router to get client IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'

    const { success } = await limiter.limit(`${action}_${ip}`)
    return { success }
  } catch (error) {
    console.error(`[RateLimit] Error checking limit for ${action}:`, error)
    // Fail open safely to avoid breaking legitimate bookings
    return { success: true }
  }
}
